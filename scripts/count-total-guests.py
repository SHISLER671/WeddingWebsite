#!/usr/bin/env python3
"""
Script to count total guests including plus ones from MASTERGUESTLIST.csv
"""

import csv

def main():
    total_guests = 0
    entries_with_headcount = 0
    entries_without_headcount = 0
    
    with open('MASTERGUESTLIST.csv', 'r', encoding='utf-8') as f:
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
                    entries_with_headcount += 1
                except ValueError:
                    entries_without_headcount += 1
            else:
                entries_without_headcount += 1
                # If no headcount specified, assume 1
                total_guests += 1
    
    print("=" * 60)
    print("TOTAL GUEST COUNT (including plus ones)")
    print("=" * 60)
    print(f"\nTotal Guests: {total_guests}")
    print(f"Entries with headcount: {entries_with_headcount}")
    print(f"Entries without headcount (assumed 1): {entries_without_headcount}")
    print(f"Total entries: {entries_with_headcount + entries_without_headcount}")
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()

