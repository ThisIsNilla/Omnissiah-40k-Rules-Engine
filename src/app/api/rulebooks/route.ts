import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const rulebooksDir = path.join(process.cwd(), 'rulebooks');
    const files = fs.readdirSync(rulebooksDir);
    
    const factions = files
      .filter(file => file.includes('faction_pack'))
      .map(file => {
        // Extract faction name from something like: eng_wh40k_faction_pack_adeptus_mechanicus-xxx.pdf
        const match = file.match(/faction_pack_([a-zA-Z0-9_]+)/);
        let name = match ? match[1] : file;
        
        // Clean up the name (replace underscores with spaces, capitalize words)
        name = name.split('_')
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                   .join(' ');
                   
        return name;
      })
      .sort();

    return NextResponse.json({ factions });
  } catch (error) {
    console.error('Failed to read rulebooks:', error);
    return NextResponse.json({ factions: [] });
  }
}
