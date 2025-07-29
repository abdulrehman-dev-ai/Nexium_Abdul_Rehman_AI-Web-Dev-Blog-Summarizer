import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('nav, header, footer, script, style, noscript, aside').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: 'Scraping failed', detail: err.message }, { status: 500 });
  }
}
