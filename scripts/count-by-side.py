#!/usr/bin/env python3
"""
Script to count total guests by side (GLIST vs BLIST)
"""

import csv

def count_guests_in_file(filename):
    """Count total guests in a CSV file"""
    total_guests = 0
    entry_count = 0
    
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # Skip header
        
        for row in reader:
            if not row or len(row) < 4:
                continue
            
            # Headcount is in column 3 (index 3)
            headcount_str = row[3].strip() if len(row) > 3 else ''
            
            if headcount_str:
                try:
                    headcount = int(headcount_str)
                    total_guests += headcount
                    entry_count += 1
                except ValueError:
                    # If invalid, assume 1
                    total_guests += 1
                    entry_count += 1
            else:
                # If no headcount specified, assume 1
                total_guests += 1
                entry_count += 1
    
    return total_guests, entry_count

def main():
    # Count GLIST (Groom's side)
    glist_total, glist_entries = count_guests_in_file('GLIST.csv')
    
    # Count BLIST (Bride's side)
    blist_total, blist_entries = count_guests_in_file('BLIST.csv')
    
    # Total
    grand_total = glist_total + blist_total
    total_entries = glist_entries + blist_entries
    
    print("=" * 60)
    print("GUEST COUNT BREAKDOWN BY SIDE")
    print("=" * 60)
    print(f"\n📋 GLIST (Groom's Side):")
    print(f"   Entries: {glist_entries}")
    print(f"   Total Guests: {glist_total}")
    
    print(f"\n📋 BLIST (Bride's Side):")
    print(f"   Entries: {blist_entries}")
    print(f"   Total Guests: {blist_total}")
    
    print(f"\n📊 GRAND TOTAL:")
    print(f"   Total Entries: {total_entries}")
    print(f"   Total Guests: {grand_total}")
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()
