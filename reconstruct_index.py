
import re
import os
import json

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base_path = '/Users/sq/Documents/github-personal-page/sheng-qiang.github.io'
original_html = read_file(os.path.join(base_path, 'original_index.html'))
current_html = read_file(os.path.join(base_path, 'index.html'))

# Load BibTeX data
bibtex_path = os.path.join(base_path, 'data/bibtex.json')
bibtex_data = {}
if os.path.exists(bibtex_path):
    with open(bibtex_path, 'r', encoding='utf-8') as f:
        bibtex_data = json.load(f)

# BibTeX Injection Script
bibtex_script = f'''
<script>
    const bibtexData = {json.dumps(bibtex_data)};

    function copyBibtex(paperId) {{
        const bibtex = bibtexData[paperId];
        if (bibtex) {{
            navigator.clipboard.writeText(bibtex).then(() => {{
                showNotification("BibTeX copied to clipboard!");
            }}).catch(err => {{
                console.error('Failed to copy: ', err);
                alert("Failed to copy BibTeX.");
            }});
        }} else {{
            alert("BibTeX not found for this paper.");
        }}
    }}

    function showNotification(message) {{
        let notification = document.createElement('div');
        notification.innerText = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#333';
        notification.style.color = '#fff';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(notification);

        // Fade in
        setTimeout(() => {{ notification.style.opacity = '1'; }}, 10);

        // Fade out and remove
        setTimeout(() => {{
            notification.style.opacity = '0';
            setTimeout(() => {{ document.body.removeChild(notification); }}, 500);
        }}, 2000);
    }}
</script>
'''

# Helper to extract content between markers
def extract_section(html, start_marker, end_marker):
    pattern = re.escape(start_marker) + r'(.*?)' + re.escape(end_marker)
    match = re.search(pattern, html, re.DOTALL)
    return match.group(1) if match else ''

def process_publications(html):
    section_content = extract_section(html, '<heading>Publications</heading>', '<!-- Publications End -->')
    
    # Step 1: Subheadings
    processed = re.sub(r'<td[^>]*>\s*<subheading>(.*?)</subheading>\s*</td>', 
                       r'<h3 class="subheading">\1</h3>', section_content, flags=re.DOTALL)
    processed = re.sub(r'<subheading>(.*?)</subheading>', 
                       r'<h3 class="subheading">\1</h3>', processed, flags=re.DOTALL)

    # Step 2: Items
    def pub_replacer(match):
        content = match.group(1)
        if not content.strip(): return ''
        
        # Inject BibTeX link if ID matches
        paper_id_match = re.search(r'<papertitle id="(.*?)">', content)
        if paper_id_match:
            paper_id = paper_id_match.group(1)
            if paper_id in bibtex_data:
                bibtex_link = f' / <a href="javascript:void(0)" onclick="copyBibtex(\'{paper_id}\')">BibTeX</a>'
                
                # Intelligent placement of BibTeX link
                # 1. Try to place before TL;DR section
                tldr_match = re.search(r'(\s*<br>\s*<span class="tldr">)', content)
                if tldr_match:
                    # Insert before the <br> that precedes tldr
                    insert_pos = tldr_match.start()
                    content = content[:insert_pos] + bibtex_link + content[insert_pos:]
                else:
                    # 2. If no TL;DR, append to the end, but check for trailing tags like </td> (though regex excludes </td>)
                    # The content is what's inside <td>...</td>.
                    # Usually ends with a link or text.
                    content += bibtex_link

        return f'<div class="publication-item"><div class="pub-content">{content}</div></div>'

    processed = re.sub(r'<tr>\s*<td[^>]*>(.*?)</td>\s*</tr>', pub_replacer, processed, flags=re.DOTALL)
    
    # Step 3: Cleanup
    processed = re.sub(r'<table[^>]*>', '', processed)
    processed = re.sub(r'</table>', '', processed)
    processed = re.sub(r'<tbody[^>]*>', '', processed)
    processed = re.sub(r'</tbody>', '', processed)
    processed = re.sub(r'<colgroup>.*?</colgroup>', '', processed, flags=re.DOTALL)
    processed = re.sub(r'<col[^>]*>', '', processed)
    processed = re.sub(r'</td>', '', processed)
    processed = re.sub(r'<td[^>]*>', '', processed)
    processed = re.sub(r'</tr>', '', processed)
    processed = re.sub(r'<tr>', '', processed)
    
    return processed

def process_talks(html):
    section_content = extract_section(html, '<heading>Talks</heading>', '<!-- Talks End -->')
    
    output = '<ul class="news-list">\n'
    
    matches = re.finditer(r'<tr>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>', section_content, flags=re.DOTALL)
    for match in matches:
        date = match.group(1).strip()
        content = match.group(2).strip()
        
        # Format bilingual titles
        # Pattern: <strong>English（Chinese）</strong>
        # Replace with: <strong>English</strong><br><strong>Chinese</strong>
        # More robust regex to handle spacing and different parentheses
        content = re.sub(r'<strong>\s*(.*?)\s*[（\(](.*?)[）\)]\s*</strong>', r'<strong>\1</strong><br><strong>\2</strong>', content)
        
        output += f'''        <li class="news-item">
            <span class="news-date">{date}</span>
            <span class="news-content">{content}</span>
        </li>\n'''
    
    output += '</ul>'
    return output

def process_teaching(html):
    section_content = extract_section(html, '<heading>Teaching Experience</heading>', '<!-- Teaching End -->')
    output = '<ul class="news-list">\n'
    matches = re.finditer(r'<tr>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>', section_content, flags=re.DOTALL)
    for match in matches:
        date = match.group(1).strip()
        content = match.group(2).strip()
        output += f'''        <li class="news-item">
            <span class="news-date">{date}</span>
            <span class="news-content">{content}</span>
        </li>\n'''
    output += '</ul>'
    return output

def process_services(html):
    section_content = extract_section(html, '<heading>Academic Services</heading>', '<!-- Profession End -->')
    output = ''
    matches = re.finditer(r'<tr>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>', section_content, flags=re.DOTALL)
    for match in matches:
        role = match.group(1).strip()
        content = match.group(2).strip()
        output += f'''        <div class="service-item">
            <h4>{role}</h4>
            <div class="service-content">{content}</div>
        </div>\n'''
    return output

def process_education(html):
    section_content = extract_section(html, '<heading>Education</heading>', '<!-- Education End -->')
    output = '<ul class="news-list">\n'
    matches = re.finditer(r'<tr>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>', section_content, flags=re.DOTALL)
    for match in matches:
        date = match.group(1).strip()
        content = match.group(2).strip()
        output += f'''        <li class="news-item">
            <span class="news-date">{date}</span>
            <span class="news-content">{content}</span>
        </li>\n'''
    output += '</ul>'
    return output

def process_awards(html):
    section_content = extract_section(html, '<heading>Honors and Awards</heading>', '<!-- Awards End -->')
    output = '<ul class="news-list">\n'
    matches = re.finditer(r'<tr>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>', section_content, flags=re.DOTALL)
    for match in matches:
        date = match.group(1).strip()
        content = match.group(2).strip()
        output += f'''        <li class="news-item">
            <span class="news-date">{date}</span>
            <span class="news-content">{content}</span>
        </li>\n'''
    output += '</ul>'
    return output

def process_team(html):
    section_content = extract_section(html, '<heading>Team Members and Alumni</heading>', '<!-- Students End -->')
    match = re.search(r'<ul>(.*?)</ul>', section_content, flags=re.DOTALL)
    if match:
        content = match.group(1)
        return f'<ul class="news-list" style="list-style: disc; padding-left: 20px;">{content}</ul>'
    return ''

def process_tutorials(html):
    section_content = extract_section(html, '<heading>Tutorials</heading>', '<!-- Talks Begin -->')
    processed = re.sub(r'<table[^>]*>', '', section_content)
    processed = re.sub(r'</table>', '', processed)
    processed = re.sub(r'<tbody[^>]*>', '', processed)
    processed = re.sub(r'</tbody>', '', processed)
    processed = re.sub(r'<colgroup>.*?</colgroup>', '', processed, flags=re.DOTALL)
    
    def pub_replacer(match):
        content = match.group(1)
        if not content.strip(): return ''
        return f'<div class="publication-item"><div class="pub-content">{content}</div></div>'

    processed = re.sub(r'<tr>\s*<td[^>]*>(.*?)</td>\s*</tr>', pub_replacer, processed, flags=re.DOTALL)
    
    processed = re.sub(r'</td>', '', processed)
    processed = re.sub(r'<td[^>]*>', '', processed)
    processed = re.sub(r'</tr>', '', processed)
    processed = re.sub(r'<tr>', '', processed)
    
    return processed

# --- Execution ---

# 1. Highlights from Original
def process_highlights(html):
    match = re.search(r'<div style="background-color: #F3F7FC!important;padding: 14px;">(.*?)</div>', html, re.DOTALL)
    if match:
        content = match.group(1).strip()
        return f'<section id="highlights"><div style="background-color: #F3F7FC; padding: 14px; margin-bottom: 20px;">{content}</div></section>'
    return ''

highlights_section = process_highlights(original_html)

# 2. News from Current
raw_news = extract_section(current_html, '<section id="news">', '</section>')
news_section = f'<section id="news">{raw_news}</section>'


# 2. Intro Section and Header Links
intro_section = extract_section(current_html, '<section class="intro-section">', '</section>')
# Add missing links
missing_links = ' &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;\n                <a href="https://www.zhihu.com/column/c_1394265881195753473"> Zhihu Column </a>  &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;\n                <a href="https://aclanthology.org/people/q/qiang-sheng/">ACL Anthology</a> &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;\n                <a href="https://ir.webis.de/anthology/people/q/qiang+sheng/"> IR Anthology </a> '

if 'Zhihu Column' not in intro_section:
    intro_section = intro_section.replace('<a href="https://dblp.org/pid/199/7557-1.html"> DBLP </a>', '<a href="https://dblp.org/pid/199/7557-1.html"> DBLP </a>' + missing_links)

intro_section = f'<section class="intro-section">{intro_section}</section>'

# Header Part
# Inject BibTeX script into head
header_part = current_html.split('<div class="container">')[0]
if '</head>' in header_part:
    header_part = header_part.replace('</head>', bibtex_script + '\n</head>')
else:
    # Fallback if head tag not found easily (unlikely)
    header_part += bibtex_script

header_part += '<div class="container">\n'

# 3. Extract and Process Sections from Original
publications_content = process_publications(original_html)
tutorials_content = process_tutorials(original_html)
talks_content = process_talks(original_html)
teaching_content = process_teaching(original_html)
services_content = process_services(original_html)
education_content = process_education(original_html)
awards_content = process_awards(original_html)
team_content = process_team(original_html)

# Footer content (Busuanzi)
footer_match = re.search(r'<span id="busuanzi_container_site_pv">.*?</span>.*?</span>', original_html, flags=re.DOTALL)
busuanzi_counter = footer_match.group(0) if footer_match else ''

# 4. Construct New HTML
new_html = f"""{header_part}
    {intro_section}
    
    <main>
      {highlights_section}
      
      {news_section}

      <section id="publications">
         <h2 class="section-title">Publications</h2>
         {publications_content}
      </section>
      
      <section id="tutorials">
         <h2 class="section-title">Tutorials</h2>
         {tutorials_content}
      </section>

      <section id="talks">
         <h2 class="section-title">Talks</h2>
         {talks_content}
      </section>
      
      <section id="teaching">
         <h2 class="section-title">Teaching Experience</h2>
         {teaching_content}
      </section>

      <section id="service">
         <h2 class="section-title">Academic Services</h2>
         {services_content}
      </section>

      <section id="education">
         <h2 class="section-title">Education</h2>
         {education_content}
      </section>

      <section id="awards">
         <h2 class="section-title">Honors and Awards</h2>
         {awards_content}
      </section>

      <section id="team">
         <h2 class="section-title">Team Members and Alumni</h2>
         {team_content}
      </section>
    </main>

    <footer>
        <p class="footer">
            Design: <a href="https://jonbarron.info/" target="_blank">Jon Barron</a> and <a href="https://liminyang.web.illinois.edu/" target="_blank">Limin Yang</a><br>
            Last updated: <script>document.write(new Date().toLocaleDateString())</script>
            &nbsp;&nbsp;
            {busuanzi_counter}
        </p>
    </footer>

  </div>
</body>
</html>
"""

# Write result
write_file(os.path.join(base_path, 'index.html'), new_html)
print("index.html successfully reconstructed!")
