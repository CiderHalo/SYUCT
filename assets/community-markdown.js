(() => {
  const emojiMap = {
    ':thought_balloon:':'💭', ':school:':'🏫', ':mega:':'📣', ':bulb:':'💡', ':sparkles:':'✨'
  };

  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function fallback(md){
    return md.replace(/```([\s\S]*?)```/g,(m,c)=>'<pre><code>'+escapeHtml(c.trim())+'</code></pre>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>');
  }

  window.communityMarkdownRender = function(md){
    let text = String(md||'');
    Object.entries(emojiMap).forEach(([a,b])=>{text=text.split(a).join(b)});
    if(window.markdownit){
      const parser=window.markdownit({html:false,linkify:true,breaks:true});
      return parser.render(text);
    }
    return fallback(text);
  };
})();
