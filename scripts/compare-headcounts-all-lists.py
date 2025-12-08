#!/usr/bin/env python3
"""
Compare headcounts across all 5 guest lists:
- MASTERGUESTLIST.csv
- GLIST.csv (Groom side - all invited)
- BLIST.csv (Bride side - all invited)
- ATTENDEESGroom.csv (Groom side - expected attendees)
- ATTENDEESBride.csv (Bride side - expected attendees)
"""

import csv
import re

def parse_headcount(headcount_str):
    """Parse headcount from various formats, returns (base_count, plus_ones, total)"""
    if not headcount_str or not headcount_str.strip():
        return (0, 0, 0)
    
    headcount_str = str(headcount_str).strip()
    
    # Try to extract from formats like "+2,4" where 2 is plus ones, 4 is total
    match = re.search(r'\+(\d+),(\d+)', headcount_str)
    if match:
        plus_ones = int(match.group(1))
        total = int(match.group(2))
        base_count = total - plus_ones
        return (base_count, plus_ones, total)
    
    # Look for just a number (assume no plus ones)
    match = re.search(r'^(\d+)$', headcount_str)
    if match:
        total = int(match.group(1))
        return (total, 0, total)
    
    # Default: try to extract any number
    numbers = re.findall(r'\d+', headcount_str)
    if numbers:
        total = int(numbers[-1])  # Take the last number found
        return (total, 0, total)
    
    return (0, 0, 0)

def calculate_headcount(filepath, description):
    """Calculate total headcount and plus ones from a CSV file"""
    total_headcount = 0
    total_plus_ones = 0
    total_base_count = 0
    total_entries = 0
    entries_without_headcount = 0
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader, None)  # Skip header
            
            # Find headcount and notes column indices
            headcount_col = None
            notes_col = None
            if header:
                for i, col in enumerate(header):
                    col_lower = col.lower()
                    if 'headcount' in col_lower:
                        headcount_col = i
                    elif 'notes' in col_lower:
                        notes_col = i
            
            for row in reader:
                if not row or len(row) < 2:
                    continue
                
                # Skip empty rows
                if not row[1] or not row[1].strip():
                    continue
                
                total_entries += 1
                name = row[1].strip()
                
                # Get total from headcount column
                total = 0
                if headcount_col and headcount_col < len(row) and row[headcount_col]:
                    total_str = str(row[headcount_col]).strip()
                    if total_str:
                        match = re.search(r'^(\d+)$', total_str)
                        if match:
                            total = int(match.group(1))
                
                # Get plus ones from notes column
                plus_ones = 0
                notes = ""
                if notes_col and notes_col < len(row):
                    notes = str(row[notes_col] or "").strip()
                
                # Look for plus one indicators in notes (format: "+1", "+2", "+1, ENTOURAGE", etc.)
                plus_one_match = re.search(r'\+(\d+)', notes)
                if plus_one_match:
                    plus_ones = int(plus_one_match.group(1))
                
                # If no total from headcount column, try to infer from name and notes
                if total == 0:
                    # Check for common patterns in name
                    if '&' in name or 'and' in name.lower():
                        base_count = 2
                    elif 'family' in name.lower():
                        base_count = 4
                    else:
                        base_count = 1
                    
                    # If we found plus ones in notes, use that
                    if plus_ones == 0:
                        # Check name for guest indicators
                        if 'guest' in name.lower():
                            if '&' in name or 'and' in name.lower():
                                plus_ones = 0  # Already counted as 2
                            else:
                                plus_ones = 1
                    
                    total = base_count + plus_ones
                    entries_without_headcount += 1
                
                # Calculate base count
                base_count = total - plus_ones
                
                total_base_count += base_count
                total_plus_ones += plus_ones
                total_headcount += total
                
    except FileNotFoundError:
        print(f"⚠️  File not found: {filepath}")
        return None, None, None, None, None
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
        return None, None, None, None, None
    
    return total_entries, total_base_count, total_plus_ones, total_headcount, entries_without_headcount

def main():
    print("=" * 70)
    print("HEADCOUNT COMPARISON - ALL GUEST LISTS")
    print("=" * 70)
    print()
    
    lists = [
        ("MASTERGUESTLIST.csv", "MASTERGUESTLIST (All invited)"),
        ("GLIST.csv", "GLIST (Groom side - all invited)"),
        ("BLIST.csv", "BLIST (Bride side - all invited)"),
        ("ATTENDEESGroom.csv", "ATTENDEES Groom (Groom side - expected attendees)"),
        ("ATTENDEESBride.csv", "ATTENDEES Bride (Bride side - expected attendees)"),
    ]
    
    results = {}
    
    for filepath, description in lists:
        entries, base_count, plus_ones, headcount, inferred = calculate_headcount(filepath, description)
        if entries is not None:
            results[description] = {
                'entries': entries,
                'base_count': base_count,
                'plus_ones': plus_ones,
                'headcount': headcount,
                'inferred': inferred
            }
            print(f"📋 {description}")
            print(f"   Entries: {entries}")
            print(f"   Base Count: {base_count} people")
            print(f"   Plus Ones: {plus_ones} people")
            print(f"   Total Headcount: {headcount} people")
            if inferred > 0:
                print(f"   ⚠️  {inferred} entries had inferred headcount (no explicit count)")
            print()
    
    # Comparison summary
    print("=" * 70)
    print("COMPARISON SUMMARY")
    print("=" * 70)
    print()
    
    if 'MASTERGUESTLIST (All invited)' in results:
        master = results['MASTERGUESTLIST (All invited)']
        print(f"📊 MASTERGUESTLIST:")
        print(f"   Base: {master['base_count']} people, Plus Ones: {master['plus_ones']} people, Total: {master['headcount']} people")
        print()
    
    # Groom side comparison
    if 'GLIST (Groom side - all invited)' in results and 'ATTENDEES Groom (Groom side - expected attendees)' in results:
        glist = results['GLIST (Groom side - all invited)']
        attendees_groom = results['ATTENDEES Groom (Groom side - expected attendees)']
        print(f"👔 GROOM SIDE:")
        print(f"   GLIST (all invited): Base: {glist['base_count']}, Plus Ones: {glist['plus_ones']}, Total: {glist['headcount']}")
        print(f"   ATTENDEES (expected): Base: {attendees_groom['base_count']}, Plus Ones: {attendees_groom['plus_ones']}, Total: {attendees_groom['headcount']}")
        diff_plus_ones = glist['plus_ones'] - attendees_groom['plus_ones']
        diff_people = glist['headcount'] - attendees_groom['headcount']
        print(f"   Plus Ones Difference: {diff_plus_ones} fewer plus ones (not expected to attend)")
        print(f"   Total Difference: {diff_people} fewer people (not expected to attend)")
        print()
    
    # Bride side comparison
    if 'BLIST (Bride side - all invited)' in results and 'ATTENDEES Bride (Bride side - expected attendees)' in results:
        blist = results['BLIST (Bride side - all invited)']
        attendees_bride = results['ATTENDEES Bride (Bride side - expected attendees)']
        print(f"👰 BRIDE SIDE:")
        print(f"   BLIST (all invited): Base: {blist['base_count']}, Plus Ones: {blist['plus_ones']}, Total: {blist['headcount']}")
        print(f"   ATTENDEES (expected): Base: {attendees_bride['base_count']}, Plus Ones: {attendees_bride['plus_ones']}, Total: {attendees_bride['headcount']}")
        diff_plus_ones = blist['plus_ones'] - attendees_bride['plus_ones']
        diff_people = blist['headcount'] - attendees_bride['headcount']
        if diff_plus_ones < 0:
            print(f"   Plus Ones Difference: {abs(diff_plus_ones)} more plus ones in ATTENDEES")
        else:
            print(f"   Plus Ones Difference: {diff_plus_ones} fewer plus ones (not expected to attend)")
        if diff_people < 0:
            print(f"   Total Difference: {abs(diff_people)} more people in ATTENDEES")
        else:
            print(f"   Total Difference: {diff_people} fewer people (not expected to attend)")
        print()
    
    # Total comparison
    if 'GLIST (Groom side - all invited)' in results and 'BLIST (Bride side - all invited)' in results:
        glist = results['GLIST (Groom side - all invited)']
        blist = results['BLIST (Bride side - all invited)']
        total_base = glist['base_count'] + blist['base_count']
        total_plus_ones = glist['plus_ones'] + blist['plus_ones']
        total_invited = glist['headcount'] + blist['headcount']
        print(f"📊 TOTAL INVITED (GLIST + BLIST):")
        print(f"   Base: {total_base} people, Plus Ones: {total_plus_ones} people, Total: {total_invited} people")
        print()
    
    if 'ATTENDEES Groom (Groom side - expected attendees)' in results and 'ATTENDEES Bride (Bride side - expected attendees)' in results:
        attendees_groom = results['ATTENDEES Groom (Groom side - expected attendees)']
        attendees_bride = results['ATTENDEES Bride (Bride side - expected attendees)']
        total_base = attendees_groom['base_count'] + attendees_bride['base_count']
        total_plus_ones = attendees_groom['plus_ones'] + attendees_bride['plus_ones']
        total_attendees = attendees_groom['headcount'] + attendees_bride['headcount']
        print(f"📊 TOTAL EXPECTED ATTENDEES (ATTENDEES Groom + ATTENDEES Bride):")
        print(f"   Base: {total_base} people, Plus Ones: {total_plus_ones} people, Total: {total_attendees} people")
        print()
        
        if 'GLIST (Groom side - all invited)' in results and 'BLIST (Bride side - all invited)' in results:
            glist = results['GLIST (Groom side - all invited)']
            blist = results['BLIST (Bride side - all invited)']
            total_invited_plus_ones = glist['plus_ones'] + blist['plus_ones']
            not_attending_plus_ones = total_invited_plus_ones - total_plus_ones
            not_attending = total_invited - total_attendees
            print(f"📊 NOT EXPECTED TO ATTEND:")
            print(f"   Plus Ones: {not_attending_plus_ones} people")
            print(f"   Total: {not_attending} people")
            print()
    
    # Master vs Combined
    if 'MASTERGUESTLIST (All invited)' in results:
        master = results['MASTERGUESTLIST (All invited)']
        if 'GLIST (Groom side - all invited)' in results and 'BLIST (Bride side - all invited)' in results:
            glist = results['GLIST (Groom side - all invited)']
            blist = results['BLIST (Bride side - all invited)']
            combined_base = glist['base_count'] + blist['base_count']
            combined_plus_ones = glist['plus_ones'] + blist['plus_ones']
            combined_headcount = glist['headcount'] + blist['headcount']
            print(f"📊 MASTERGUESTLIST vs GLIST + BLIST:")
            print(f"   MASTERGUESTLIST: Base: {master['base_count']}, Plus Ones: {master['plus_ones']}, Total: {master['headcount']}")
            print(f"   GLIST + BLIST: Base: {combined_base}, Plus Ones: {combined_plus_ones}, Total: {combined_headcount}")
            if master['headcount'] != combined_headcount:
                print(f"   ⚠️  Total mismatch: {master['headcount']} vs {combined_headcount}")
            if master['plus_ones'] != combined_plus_ones:
                print(f"   ⚠️  Plus ones mismatch: {master['plus_ones']} vs {combined_plus_ones}")
            if master['headcount'] == combined_headcount and master['plus_ones'] == combined_plus_ones:
                print(f"   ✅ Counts match!")
            print()
    
    print("=" * 70)

if __name__ == '__main__':
    main()

