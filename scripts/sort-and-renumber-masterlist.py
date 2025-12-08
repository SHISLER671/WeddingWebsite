#!/usr/bin/env python3
"""
Script to sort MASTERGUESTLIST.csv alphabetically and renumber sequentially
"""

import csv
import re

def normalize_name(name):
    """Normalize name for comparison"""
    # Remove common prefixes
    name = re.sub(r'^(Uncle|Auntie|Nino|Nina|Untle|Fr\.)\s+', '', name, flags=re.IGNORECASE)
    # Remove extra spaces
    name = ' '.join(name.split())
    return name.lower().strip()

def main():
    # Read current MASTERGUESTLIST.csv
    entries = []
    
    with open('MASTERGUESTLIST.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if row and len(row) >= 2 and row[1].strip():  # Skip empty rows
                entries.append(row)
    
    # Sort alphabetically by name (ignoring prefixes)
    def sort_key(row):
        name = row[1].strip() if len(row) > 1 else ''
        return normalize_name(name)
    
    entries.sort(key=sort_key)
    
    # Write updated MASTERGUESTLIST with sequential numbering
    with open('MASTERGUESTLIST.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        # Write header
        writer.writerow(header)
        
        # Write entries with sequential numbering
        for i, entry in enumerate(entries, start=1):
            entry[0] = str(i)  # Update the number column
            writer.writerow(entry)
    
    print(f"✅ Sorted and renumbered MASTERGUESTLIST.csv")
    print(f"   Total entries: {len(entries)}")

if __name__ == '__main__':
    main()
