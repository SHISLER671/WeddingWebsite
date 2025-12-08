#!/usr/bin/env python3
"""
Script to calculate headcounts from MASTERGUESTLIST.csv and ATTENDEESBride.csv
"""

import csv
import re

def parse_headcount(headcount_str, notes_str, name_str):
    """Parse headcount from headcount column"""
    if not headcount_str:
        headcount_str = ""
    
    # Headcount column contains the total - extract the number
    headcount_match = re.search(r'(\d+)', headcount_str)
    if headcount_match:
        return int(headcount_match.group(1))
    
    # If no headcount column, infer from name
    # Couples typically have & or "and"
    if '&' in name_str or 'and' in name_str.lower():
        return 2
    
    return 1

def extract_plus_ones(notes_str):
    """Extract plus ones from notes column (e.g., "+1", "+2", "+4")"""
    if not notes_str:
        return 0
    
    plus_match = re.search(r'\+(\d+)', notes_str)
    if plus_match:
        return int(plus_match.group(1))
    
    return 0

def calculate_file_stats(filename):
    """Calculate statistics for a CSV file"""
    total_headcount = 0
    base_count = 0
    plus_ones = 0
    entry_count = 0
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            
            # Find column indices
            name_idx = 1 if len(header) > 1 else 0
            notes_idx = 2 if len(header) > 2 else -1
            headcount_idx = 3 if len(header) > 3 else -1
            
            for row in reader:
                if not row or len(row) <= name_idx or not row[name_idx].strip():
                    continue
                
                entry_count += 1
                name = row[name_idx].strip()
                notes = row[notes_idx].strip() if notes_idx >= 0 and len(row) > notes_idx else ""
                headcount_str = row[headcount_idx].strip() if headcount_idx >= 0 and len(row) > headcount_idx else ""
                
                # Parse total headcount from headcount column
                total = parse_headcount(headcount_str, notes, name)
                total_headcount += total
                
                # Extract plus ones from notes column
                plus_count = extract_plus_ones(notes)
                plus_ones += plus_count
                
                # Base count = total - plus ones
                base_count += (total - plus_count)
    except FileNotFoundError:
        return None
    
    return {
        'entry_count': entry_count,
        'total_headcount': total_headcount,
        'base_count': base_count,
        'plus_ones': plus_ones
    }

def main():
    print("=" * 60)
    print("HEADCOUNT CALCULATIONS")
    print("=" * 60)
    
    # Calculate for MASTERGUESTLIST
    print("\n📋 MASTERGUESTLIST.csv")
    print("-" * 60)
    master_stats = calculate_file_stats('MASTERGUESTLIST.csv')
    if master_stats:
        print(f"Total Entries: {master_stats['entry_count']}")
        print(f"Grand Total (including plus ones): {master_stats['total_headcount']}")
        print(f"Plus Ones: {master_stats['plus_ones']}")
        print(f"Base Count (Total - Plus Ones): {master_stats['total_headcount'] - master_stats['plus_ones']}")
        print(f"  (Calculated: {master_stats['base_count']})")
    else:
        print("File not found")
    
    # Calculate for ATTENDEESBride
    print("\n📋 ATTENDEESBride.csv")
    print("-" * 60)
    bride_stats = calculate_file_stats('ATTENDEESBride.csv')
    if bride_stats:
        print(f"Total Entries: {bride_stats['entry_count']}")
        print(f"Grand Total (including plus ones): {bride_stats['total_headcount']}")
        print(f"Plus Ones: {bride_stats['plus_ones']}")
        print(f"Base Count (Total - Plus Ones): {bride_stats['total_headcount'] - bride_stats['plus_ones']}")
        print(f"  (Calculated: {bride_stats['base_count']})")
    else:
        print("File not found")
    
    # Calculate for ATTENDEESGroom
    print("\n📋 ATTENDEESGroom.csv")
    print("-" * 60)
    groom_stats = calculate_file_stats('ATTENDEESGroom.csv')
    if groom_stats:
        print(f"Total Entries: {groom_stats['entry_count']}")
        print(f"Grand Total (including plus ones): {groom_stats['total_headcount']}")
        print(f"Plus Ones: {groom_stats['plus_ones']}")
        print(f"Base Count (Total - Plus Ones): {groom_stats['total_headcount'] - groom_stats['plus_ones']}")
        print(f"  (Calculated: {groom_stats['base_count']})")
    else:
        print("File not found")
    
    # Summary
    if master_stats and bride_stats and groom_stats:
        print("\n📊 SUMMARY")
        print("-" * 60)
        print(f"MASTERGUESTLIST Total: {master_stats['total_headcount']}")
        print(f"ATTENDEESBride Total: {bride_stats['total_headcount']}")
        print(f"ATTENDEESGroom Total: {groom_stats['total_headcount']}")
        print(f"Bride + Groom Combined: {bride_stats['total_headcount'] + groom_stats['total_headcount']}")
        print(f"Difference (Master - Combined): {master_stats['total_headcount'] - (bride_stats['total_headcount'] + groom_stats['total_headcount'])}")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()

