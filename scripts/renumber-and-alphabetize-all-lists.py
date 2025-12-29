#!/usr/bin/env python3
"""
Script to renumber and alphabetize all guest list CSV files
"""

import csv
import re
from pathlib import Path

def normalize_name(name):
    """Normalize name for comparison - remove titles and extra spaces"""
    if not name:
        return ""
    # Remove common prefixes
    name = re.sub(r'^(Uncle|Auntie|Nino|Nina|Fr\.)\s+', '', name, flags=re.IGNORECASE)
    # Remove extra spaces
    name = ' '.join(name.split())
    return name.lower().strip()

def process_csv_file(filepath):
    """Process a single CSV file: sort and renumber"""
    if not filepath.exists():
        print(f"⚠️  File not found: {filepath}")
        return False
    
    print(f"\n📝 Processing: {filepath.name}")
    
    # Read current file
    entries = []
    header = None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print(f"   ❌ Empty file")
            return False
        
        for row in reader:
            if row and len(row) >= 2 and row[1].strip():  # Skip empty rows
                entries.append(row)
    
    if not entries:
        print(f"   ⚠️  No entries found")
        return False
    
    print(f"   Found {len(entries)} entries")
    
    # Sort alphabetically by name (ignoring prefixes)
    def sort_key(row):
        name = row[1].strip() if len(row) > 1 else ''
        return normalize_name(name)
    
    entries.sort(key=sort_key)
    
    # Write updated file with sequential numbering
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        # Write header
        writer.writerow(header)
        
        # Write entries with sequential numbering
        for i, entry in enumerate(entries, start=1):
            if len(entry) > 0:
                entry[0] = str(i)  # Update the number column
            writer.writerow(entry)
    
    print(f"   ✅ Sorted and renumbered {len(entries)} entries")
    return True

def main():
    base_dir = Path(__file__).parent.parent
    
    # List of CSV files to process
    csv_files = [
        'MASTERGUESTLIST.csv',
        'FINALlist.csv',
        '0FFISLANDb.csv',
        'BLIST.csv',
        'GLIST.csv',
        'GROOMFAM.csv',
        'ATTENDEESBride.csv',
        'ATTENDEESGroom.csv',
    ]
    
    print("=" * 60)
    print("RENUMBER AND ALPHABETIZE ALL GUEST LISTS")
    print("=" * 60)
    
    success_count = 0
    for csv_file in csv_files:
        filepath = base_dir / csv_file
        if process_csv_file(filepath):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Completed: {success_count}/{len(csv_files)} files processed")
    print("=" * 60)

if __name__ == '__main__':
    main()
