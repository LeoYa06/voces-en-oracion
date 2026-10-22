#!/usr/bin/env python3
"""Obtain the official Spanish USCCB RSS and extract the Gospel section."""
import urllib.request, xml.etree.ElementTree as ET, re, json, datetime, html
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo

class PlainText(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]
    def handle_starttag(self, tag, attrs):
        if tag in ('p','div','br','h2','h3','h4','li'): self.parts.append('\n')
    def handle_data(self, data): self.parts.append(data)

def text_only(value):
    parser=PlainText();parser.feed(value or '')
    return html.unescape(''.join(parser.parts)).replace('\xa0',' ')

today=datetime.datetime.now(ZoneInfo('America/Chicago')).date().isoformat()
req=urllib.request.Request('https://bible.usccb.org/lecturas.rss',headers={'User-Agent':'Mozilla/5.0 VocesEnOracion/1.0'})
with urllib.request.urlopen(req,timeout=25) as response: raw=response.read()
root=ET.fromstring(raw)
items=root.findall('.//item')
if not items:
    items=root.findall('.//{http://www.w3.org/2005/Atom}entry')
if not items: raise RuntimeError('El RSS no contiene entradas')
entry=items[0]
def field(name):
    el=entry.find(name)
    return ''.join(el.itertext()) if el is not None else ''
body=field('description') or field('{http://purl.org/rss/1.0/modules/content/}encoded') or field('{http://www.w3.org/2005/Atom}content')
plain=text_only(body)
match=re.search(r'(?im)^\s*(?:\+\s*)?Evangelio\s*$',plain)
if not match:
    raise RuntimeError('No se encontró la sección Evangelio en el RSS; se conserva la versión anterior')
section=plain[match.end():]
section=re.split(r'(?im)^\s*(?:Reflexi[oó]n|Copyright|Los textos de la Sagrada Escritura)\b',section)[0]
lines=[x.strip() for x in section.splitlines() if x.strip()]
if len(lines)<2: raise RuntimeError('El Evangelio no tiene texto suficiente')
cita=lines[0] if len(lines[0])<90 else ''
texto='\n\n'.join(lines[1:] if cita else lines)
if len(texto)<80: raise RuntimeError('Texto del Evangelio incompleto')
payload={'fecha':today,'titulo':'Evangelio del día','cita':cita,'texto':texto,'fuente':'USCCB','url':'https://bible.usccb.org/es/lectura-diaria-biblia'}
Path('public').mkdir(exist_ok=True)
Path('public/evangelio.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
print('Lectura preparada para',today,cita)
