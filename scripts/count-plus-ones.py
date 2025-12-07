#!/usr/bin/env python3
"""
Quick script to tally plus ones from MASTERGUESTLIST.csv
"""

import csv
import re

def extract_plus_ones(notes):
    """Extract plus one count from notes field"""
    if not notes:
        return 0
    
    # Look for patterns like "+1", "+2", "+3", etc.
    matches = re.findall(r'\+(\d+)', notes)
    if matches:
        # Return the first match (usually there's only one)
        return int(matches[0])
    return 0

def main():
    total_plus_ones = 0
    entries_with_plus_ones = 0
    plus_one_breakdown = {}
    
    with open('MASTERGUESTLIST.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # Skip header
        
        for row in reader:
            if not row or len(row) < 4:
                continue
            
            guest_name = row[1].strip() if len(row) > 1 else ''
            notes = row[2].strip() if len(row) > 2 else ''
            headcount_str = row[3].strip() if len(row) > 3 else ''
            
            # Extract plus ones from notes
            plus_ones = extract_plus_ones(notes)
            
            if plus_ones > 0:
                entries_with_plus_ones += 1
                total_plus_ones += plus_ones
                
                # Track breakdown
                if plus_ones not in plus_one_breakdown:
                    plus_one_breakdown[plus_ones] = []
                plus_one_breakdown[plus_ones].append(guest_name)
    
    print("=" * 60)
    print("PLUS ONES TALLY")
    print("=" * 60)
    print(f"\nTotal Plus Ones: {total_plus_ones}")
    print(f"Entries with Plus Ones: {entries_with_plus_ones}")
    print(f"\nBreakdown by count:")
    
    for count in sorted(plus_one_breakdown.keys()):
        entries = plus_one_breakdown[count]
        print(f"  +{count}: {len(entries)} entries")
        if len(entries) <= 10:
            for entry in entries:
                print(f"    - {entry}")
        else:
            print(f"    (showing first 5 of {len(entries)}):")
            for entry in entries[:5]:
                print(f"    - {entry}")
            print(f"    ... and {len(entries) - 5} more")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()

