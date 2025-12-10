#!/usr/bin/env python3
"""
List ENTOURAGE and KIDENTOURAGE guests separated by bride/groom side
"""

import csv

def get_entourage_guests(filepath, description):
    """Get ENTOURAGE and KIDENTOURAGE guests from a CSV file"""
    entourage = []
    kidentourage = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            
            # Find column indices
            name_col = 1
            notes_col = None
            kidentourage_col = None
            
            if header:
                for i, col in enumerate(header):
                    if 'notes' in col.lower():
                        notes_col = i
                    if 'kidentourage' in col.lower():
                        kidentourage_col = i
            
            for row in reader:
                if not row or len(row) < 2 or not row[name_col].strip():
                    continue
                
                name = row[name_col].strip()
                notes = ""
                kidentourage_val = ""
                
                if notes_col and notes_col < len(row):
                    notes = str(row[notes_col] or "").strip()
                if kidentourage_col and kidentourage_col < len(row):
                    kidentourage_val = str(row[kidentourage_col] or "").strip()
                
                # Check for KIDENTOURAGE first (takes priority)
                if kidentourage_val and kidentourage_val.upper() in ['YES', 'Y', 'TRUE', '1']:
                    kidentourage.append(name)
                # Check for ENTOURAGE in notes
                elif 'ENTOURAGE' in notes.upper():
                    entourage.append(name)
    
    except FileNotFoundError:
        print(f"⚠️  File not found: {filepath}")
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
    
    return entourage, kidentourage

def main():
    print("=" * 70)
    print("ENTOURAGE & KIDENTOURAGE LISTS BY SIDE")
    print("=" * 70)
    print()
    
    # Get groom side (GLIST and ATTENDEESGroom)
    print("👔 GROOM SIDE ENTOURAGE")
    print("-" * 70)
    glist_entourage, glist_kid = get_entourage_guests('GLIST.csv', 'GLIST')
    attendees_groom_entourage, attendees_groom_kid = get_entourage_guests('ATTENDEESGroom.csv', 'ATTENDEES Groom')
    
    # Combine and deduplicate
    groom_entourage = sorted(set(glist_entourage + attendees_groom_entourage))
    groom_kid = sorted(set(glist_kid + attendees_groom_kid))
    
    if groom_entourage:
        print(f"📋 Found {len(groom_entourage)} ENTOURAGE guests:")
        for i, name in enumerate(groom_entourage, 1):
            print(f"   {i}. {name}")
    else:
        print("   No ENTOURAGE guests found")
    print()
    
    # Get bride side (BLIST and ATTENDEESBride)
    print("👰 BRIDE SIDE ENTOURAGE")
    print("-" * 70)
    blist_entourage, blist_kid = get_entourage_guests('BLIST.csv', 'BLIST')
    attendees_bride_entourage, attendees_bride_kid = get_entourage_guests('ATTENDEESBride.csv', 'ATTENDEES Bride')
    
    # Combine and deduplicate
    bride_entourage = sorted(set(blist_entourage + attendees_bride_entourage))
    bride_kid = sorted(set(blist_kid + attendees_bride_kid))
    
    if bride_entourage:
        print(f"📋 Found {len(bride_entourage)} ENTOURAGE guests:")
        for i, name in enumerate(bride_entourage, 1):
            print(f"   {i}. {name}")
    else:
        print("   No ENTOURAGE guests found")
    print()
    
    # Get KIDENTOURAGE (from all lists)
    print("👶 KIDENTOURAGE")
    print("-" * 70)
    master_entourage, master_kid = get_entourage_guests('MASTERGUESTLIST.csv', 'MASTERGUESTLIST')
    
    # Combine all KIDENTOURAGE
    all_kid = sorted(set(groom_kid + bride_kid + master_kid))
    
    if all_kid:
        print(f"📋 Found {len(all_kid)} KIDENTOURAGE guests:")
        for i, name in enumerate(all_kid, 1):
            print(f"   {i}. {name}")
    else:
        print("   No KIDENTOURAGE guests found")
    print()
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"👔 Groom Side ENTOURAGE: {len(groom_entourage)}")
    print(f"👰 Bride Side ENTOURAGE: {len(bride_entourage)}")
    print(f"📊 Total ENTOURAGE: {len(groom_entourage) + len(bride_entourage)}")
    print(f"👶 KIDENTOURAGE: {len(all_kid)}")
    print("=" * 70)

if __name__ == '__main__':
    main()

