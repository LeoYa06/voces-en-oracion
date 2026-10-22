#!/usr/bin/env python3
"""Extrae el Evangelio de la fecha local desde el RSS de USCCB."""
import datetime
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo

class Sections(HTMLParser):
    def __init__(self):
        super().__init__(); self.sections=[]; self.heading=None; self.collect=False; self.parts=[]
    def handle_starttag(self, tag, attrs):
        if tag == 'h4': self.heading=[]
        elif tag == 'div' and 'poetry' in dict(attrs).get('class','').split():
            self.collect=True; self.parts=[]
        elif self.collect and tag in ('p','br'): self.parts.append('\n' if tag=='p' else ' ')
    def handle_data(self, data):
        if self.heading is not None: self.heading.append(data)
        if self.collect: self.parts.append(data)
    def handle_endtag(self, tag):
        if tag == 'h4' and self.heading is not None:
            self.current_heading=' '.join(self.heading).strip(); self.heading=None
        if tag == 'div' and self.collect:
            self.sections.append((getattr(self,'current_heading',''),html.unescape(''.join(self.parts)).strip()))
            self.collect=False

def extract(raw, today):
    root=ET.fromstring(raw)
    items=root.findall('./channel/item')
    if not items: raise RuntimeError('RSS sin entradas')
    for entry in items:
        url=(entry.findtext('link') or '').strip()
        # El enlace de USCCB incluye fecha en formato MMDDYY.
        date_token=today.strftime('%m%d%y')
        if f'/{date_token}.cfm' not in url: continue
        body=entry.findtext('description') or ''
        parser=Sections();parser.feed(body)
        for heading,content in parser.sections:
            if re.match(r'^Evangelio\b',heading,re.I) and len(content)>60:
                citation=re.sub(r'^Evangelio\s*','',heading,flags=re.I).strip()
                return {'fecha':today.isoformat(),'titulo':entry.findtext('title') or 'Evangelio del día',
                        'cita':citation,'texto':content,'fuente':'USCCB','url':url}
        raise RuntimeError('La entrada de hoy no incluye un bloque Evangelio reconocible')
    raise RuntimeError('No hay una entrada RSS para la fecha de hoy (America/Chicago)')

def main():
    today=datetime.datetime.now(ZoneInfo('America/Chicago')).date()
    request=urllib.request.Request('https://bible.usccb.org/lecturas.rss',headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(request,timeout=30) as r: raw=r.read()
    data=extract(raw,today)
    Path('public').mkdir(exist_ok=True)
    Path('public/evangelio.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Evangelio preparado:',data['fecha'],data['cita'])

if __name__=='__main__':main()
