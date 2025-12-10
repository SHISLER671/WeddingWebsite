#!/usr/bin/env python3
"""
Generic script to sort any CSV file alphabetically and renumber sequentially
Usage: python3 scripts/sort-and-renumber-csv.py <filename.csv>
"""

import csv
import re
import sys

def normalize_name(name):
    """Normalize name for comparison"""
    # Remove common prefixes
    name = re.sub(r'^(Uncle|Auntie|Nino|Nina|Untle|Fr\.)\s+', '', name, flags=re.IGNORECASE)
    # Remove extra spaces
    name = ' '.join(name.split())
    return name.lower().strip()

def sort_and_renumber_csv(filename):
    """Sort CSV file alphabetically and renumber"""
    # Read current CSV
    entries = []
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            for row in reader:
                if row and len(row) >= 2 and row[1].strip():  # Skip empty rows
                    entries.append(row)
    except FileNotFoundError:
        print(f"❌ File not found: {filename}")
        return False
    except Exception as e:
        print(f"❌ Error reading {filename}: {e}")
        return False
    
    # Sort alphabetically by name (ignoring prefixes)
    def sort_key(row):
        name = row[1].strip() if len(row) > 1 else ''
        return normalize_name(name)
    
    entries.sort(key=sort_key)
    
    # Write updated CSV with sequential numbering
    try:
        with open(filename, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            # Write header
            writer.writerow(header)
            
            # Write entries with sequential numbering
            for i, entry in enumerate(entries, start=1):
                entry[0] = str(i)  # Update the number column
                writer.writerow(entry)
        
        print(f"✅ Sorted and renumbered {filename}")
        print(f"   Total entries: {len(entries)}")
        return True
    except Exception as e:
        print(f"❌ Error writing {filename}: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/sort-and-renumber-csv.py <filename.csv>")
        sys.exit(1)
    
    filename = sys.argv[1]
    sort_and_renumber_csv(filename)

if __name__ == '__main__':
    main()

