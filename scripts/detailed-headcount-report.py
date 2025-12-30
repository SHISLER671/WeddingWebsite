#!/usr/bin/env python3
"""
Detailed head count report for all CSV guest lists.
Shows total head count and count minus any '+' entries (plus-ones).
"""

import csv
import os
import re
from pathlib import Path

def parse_plus_ones(notes):
    """Extract plus-one count from Notes field."""
    if not notes:
        return 0
    
    # Look for patterns like "+1", "+2", "+3", etc.
    matches = re.findall(r'\+(\d+)', str(notes))
    if matches:
        return sum(int(m) for m in matches)
    return 0

def analyze_csv_file(filepath):
    """Analyze a single CSV file and return statistics."""
    filename = os.path.basename(filepath)
    stats = {
        'filename': filename,
        'total_entries': 0,
        'entries_with_plus': 0,
        'total_plus_ones': 0,
        'total_headcount': 0,
        'headcount_minus_plus_ones': 0,
        'has_headcount_column': False
    }
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            # Try to detect delimiter, default to comma
            sample = f.read(1024)
            f.seek(0)
            delimiter = ','
            try:
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
            except:
                delimiter = ','  # Default to comma if detection fails
            
            reader = csv.DictReader(f, delimiter=delimiter)
            
            # Check if Headcount column exists
            if reader.fieldnames:
                stats['has_headcount_column'] = 'Headcount' in reader.fieldnames or 'headcount' in [f.lower() for f in reader.fieldnames]
                # Find the actual headcount column name (case-insensitive)
                headcount_col = None
                notes_col = None
                for col in reader.fieldnames:
                    if col.lower() == 'headcount':
                        headcount_col = col
                    if col.lower() == 'notes':
                        notes_col = col
                
                for row in reader:
                    stats['total_entries'] += 1
                    
                    # Get headcount from column if available
                    row_headcount = 0
                    if headcount_col and row.get(headcount_col):
                        try:
                            row_headcount = int(row[headcount_col])
                        except (ValueError, TypeError):
                            row_headcount = 1  # Default to 1 if can't parse
                    else:
                        # If no headcount column, assume 1 per entry
                        row_headcount = 1
                    
                    stats['total_headcount'] += row_headcount
                    
                    # Check for plus-ones in Notes
                    notes = row.get(notes_col or 'Notes', '') or row.get('notes', '')
                    plus_ones = parse_plus_ones(notes)
                    
                    if plus_ones > 0:
                        stats['entries_with_plus'] += 1
                        stats['total_plus_ones'] += plus_ones
                
                stats['headcount_minus_plus_ones'] = stats['total_headcount'] - stats['total_plus_ones']
    
    except Exception as e:
        stats['error'] = str(e)
    
    return stats

def main():
    """Main function to analyze all CSV files."""
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Find all CSV files in the project root
    csv_files = list(project_root.glob('*.csv'))
    
    if not csv_files:
        print("No CSV files found in project root.")
        return
    
    print("=" * 80)
    print("DETAILED HEAD COUNT REPORT")
    print("=" * 80)
    print()
    
    all_stats = []
    grand_total_entries = 0
    grand_total_headcount = 0
    grand_total_plus_ones = 0
    
    for csv_file in sorted(csv_files):
        stats = analyze_csv_file(csv_file)
        all_stats.append(stats)
        
        if 'error' not in stats:
            grand_total_entries += stats['total_entries']
            grand_total_headcount += stats['total_headcount']
            grand_total_plus_ones += stats['total_plus_ones']
    
    # Print detailed report for each file
    for stats in all_stats:
        print(f"📄 {stats['filename']}")
        print("-" * 80)
        
        if 'error' in stats:
            print(f"❌ Error: {stats['error']}")
        else:
            print(f"   Total Entries:           {stats['total_entries']}")
            print(f"   Entries with '+' notes:  {stats['entries_with_plus']}")
            print(f"   Total Plus-Ones:         {stats['total_plus_ones']}")
            print(f"   Total Head Count:        {stats['total_headcount']}")
            print(f"   Head Count (minus +'s):  {stats['headcount_minus_plus_ones']}")
            if stats['has_headcount_column']:
                print(f"   ✓ Uses Headcount column")
            else:
                print(f"   ⚠ Assumes 1 per entry (no Headcount column)")
        
        print()
    
    # Print summary
    print("=" * 80)
    print("SUMMARY (ALL FILES COMBINED)")
    print("=" * 80)
    print(f"   Total Entries (all files):     {grand_total_entries}")
    print(f"   Total Head Count (all files):  {grand_total_headcount}")
    print(f"   Total Plus-Ones (all files):   {grand_total_plus_ones}")
    print(f"   Head Count (minus +'s):        {grand_total_headcount - grand_total_plus_ones}")
    print("=" * 80)

if __name__ == '__main__':
    main()
