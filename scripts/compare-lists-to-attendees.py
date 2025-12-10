#!/usr/bin/env python3
"""
Compare GLIST/BLIST against ATTENDEES files to find:
- Names in GLIST/BLIST but NOT in either ATTENDEES file
- Duplicates between GLIST and BLIST
"""

import csv
import re

def normalize_name(name):
    """Normalize name for comparison"""
    if not name:
        return ''
    # Remove common prefixes
    name = re.sub(r'^(Uncle|Auntie|Nino|Nina|Untle|Fr\.)\s+', '', name, flags=re.IGNORECASE)
    # Remove common suffixes
    name = re.sub(r'\s*(&|and|\+)\s*guest(s)?\s*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*family\s*$', '', name, flags=re.IGNORECASE)
    # Normalize whitespace and lowercase
    return ' '.join(name.split()).lower().strip()

def load_csv_names(filepath, description):
    """Load and normalize names from a CSV file"""
    names = set()
    raw_names = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader, None)  # Skip header
            for row in reader:
                if row and len(row) > 1 and row[1].strip():
                    raw_name = row[1].strip()
                    normalized = normalize_name(raw_name)
                    if normalized:
                        names.add(normalized)
                        raw_names.append((raw_name, normalized))
    except FileNotFoundError:
        print(f"⚠️  Warning: File not found: {filepath}")
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
    
    print(f"📋 {description}: {len(names)} unique entries")
    return names, raw_names

def main():
    print("=" * 60)
    print("COMPARING GLIST/BLIST vs ATTENDEES FILES")
    print("=" * 60)
    print()
    
    # Load all lists
    glist_names, glist_raw = load_csv_names('GLIST.csv', 'GLIST.csv (Groom side - all invited)')
    blist_names, blist_raw = load_csv_names('BLIST.csv', 'BLIST.csv (Bride side - all invited)')
    attendees_groom_names, _ = load_csv_names('ATTENDEESGroom.csv', 'ATTENDEESGroom.csv (Groom side - expected attendees)')
    attendees_bride_names, _ = load_csv_names('ATTENDEESBride.csv', 'ATTENDEESBride.csv (Bride side - expected attendees)')
    
    # Combine all attendees
    all_attendees = attendees_groom_names | attendees_bride_names
    print(f"📋 Combined ATTENDEES (both sides): {len(all_attendees)} unique entries")
    print()
    
    # Check for duplicates between GLIST and BLIST
    print("=" * 60)
    print("CHECKING FOR DUPLICATES BETWEEN GLIST AND BLIST")
    print("=" * 60)
    duplicates = glist_names & blist_names
    if duplicates:
        print(f"❌ Found {len(duplicates)} names appearing in BOTH GLIST and BLIST:")
        for dup in sorted(duplicates):
            # Find original names
            glist_orig = [r[0] for r in glist_raw if r[1] == dup]
            blist_orig = [r[0] for r in blist_raw if r[1] == dup]
            print(f"   - {glist_orig[0] if glist_orig else dup} (appears in both)")
    else:
        print("✅ No duplicates found between GLIST and BLIST")
    print()
    
    # Find names in GLIST but not in ATTENDEES
    print("=" * 60)
    print("NAMES IN GLIST BUT NOT IN EITHER ATTENDEES FILE")
    print("=" * 60)
    glist_not_attendees = glist_names - all_attendees
    if glist_not_attendees:
        print(f"📋 Found {len(glist_not_attendees)} names in GLIST not in ATTENDEES:")
        for name in sorted(glist_not_attendees):
            # Find original name
            orig = [r[0] for r in glist_raw if r[1] == name]
            print(f"   - {orig[0] if orig else name}")
    else:
        print("✅ All GLIST names are in ATTENDEES files")
    print()
    
    # Find names in BLIST but not in ATTENDEES
    print("=" * 60)
    print("NAMES IN BLIST BUT NOT IN EITHER ATTENDEES FILE")
    print("=" * 60)
    blist_not_attendees = blist_names - all_attendees
    if blist_not_attendees:
        print(f"📋 Found {len(blist_not_attendees)} names in BLIST not in ATTENDEES:")
        for name in sorted(blist_not_attendees):
            # Find original name
            orig = [r[0] for r in blist_raw if r[1] == name]
            print(f"   - {orig[0] if orig else name}")
    else:
        print("✅ All BLIST names are in ATTENDEES files")
    print()
    
    # Combined list of all names in GLIST/BLIST but not in ATTENDEES
    print("=" * 60)
    print("COMBINED: ALL NAMES IN GLIST/BLIST BUT NOT IN ATTENDEES")
    print("=" * 60)
    all_not_attendees = (glist_names | blist_names) - all_attendees
    if all_not_attendees:
        print(f"📋 Total: {len(all_not_attendees)} names invited but not expected to attend:")
        for name in sorted(all_not_attendees):
            # Find original name and which list it's from
            glist_orig = [r[0] for r in glist_raw if r[1] == name]
            blist_orig = [r[0] for r in blist_raw if r[1] == name]
            source = []
            if glist_orig:
                source.append("GLIST")
            if blist_orig:
                source.append("BLIST")
            orig_name = glist_orig[0] if glist_orig else (blist_orig[0] if blist_orig else name)
            print(f"   - {orig_name} ({', '.join(source)})")
    else:
        print("✅ All invited names (GLIST + BLIST) are in ATTENDEES files")
    print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"📊 GLIST entries: {len(glist_names)}")
    print(f"📊 BLIST entries: {len(blist_names)}")
    print(f"📊 ATTENDEES Groom: {len(attendees_groom_names)}")
    print(f"📊 ATTENDEES Bride: {len(attendees_bride_names)}")
    print(f"📊 Total ATTENDEES: {len(all_attendees)}")
    print(f"📊 Invited but not expected: {len(all_not_attendees)}")
    print(f"📊 Duplicates (GLIST ∩ BLIST): {len(duplicates)}")
    print("=" * 60)

if __name__ == '__main__':
    main()
