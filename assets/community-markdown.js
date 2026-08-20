(() => {
  // GitHub 讨论分类与正文里常见的 :shortcode: 写法。GraphQL 的 category.emoji
  // 只返回短代码，需要在前端兜底转成 Unicode。
  const EMOJI = {
    ':mega:':'📣', ':loudspeaker:':'📢', ':bell:':'🔔', ':pushpin:':'📌', ':round_pushpin:':'📍',
    ':speech_balloon:':'💬', ':thought_balloon:':'💭', ':left_speech_bubble:':'🗨️',
    ':school:':'🏫', ':books:':'📚', ':book:':'📖', ':closed_book:':'📕', ':green_book:':'📗',
    ':blue_book:':'📘', ':orange_book:':'📙', ':notebook:':'📓', ':ledger:':'📒',
    ':bookmark:':'🔖', ':bookmark_tabs:':'📑', ':label:':'🏷️', ':page_facing_up:':'📄',
    ':clipboard:':'📋', ':memo:':'📝', ':pencil:':'📝', ':pencil2:':'✏️', ':writing_hand:':'✍️',
    ':bulb:':'💡', ':sparkles:':'✨', ':star:':'⭐', ':star2:':'🌟', ':dizzy:':'💫',
    ':fire:':'🔥', ':boom:':'💥', ':zap:':'⚡', ':rainbow:':'🌈', ':sunny:':'☀️',
    ':rocket:':'🚀', ':tada:':'🎉', ':confetti_ball:':'🎊', ':gift:':'🎁', ':balloon:':'🎈',
    ':trophy:':'🏆', ':medal_sports:':'🏅', ':crown:':'👑', ':gem:':'💎',
    ':heart:':'❤️', ':orange_heart:':'🧡', ':yellow_heart:':'💛', ':green_heart:':'💚',
    ':blue_heart:':'💙', ':purple_heart:':'💜', ':two_hearts:':'💕', ':sparkling_heart:':'💖',
    ':thumbsup:':'👍', ':+1:':'👍', ':thumbsdown:':'👎', ':-1:':'👎', ':clap:':'👏',
    ':raised_hands:':'🙌', ':pray:':'🙏', ':handshake:':'🤝', ':muscle:':'💪', ':wave:':'👋',
    ':point_right:':'👉', ':point_left:':'👈', ':point_up:':'☝️', ':point_down:':'👇',
    ':eyes:':'👀', ':busts_in_silhouette:':'👥', ':bust_in_silhouette:':'👤',
    ':family:':'👪', ':student:':'🧑‍🎓', ':teacher:':'🧑‍🏫',
    ':smile:':'😄', ':smiley:':'😃', ':grin:':'😁', ':joy:':'😂', ':rofl:':'🤣',
    ':blush:':'😊', ':wink:':'😉', ':heart_eyes:':'😍', ':thinking:':'🤔', ':smirk:':'😏',
    ':sweat_smile:':'😅', ':sob:':'😭', ':cry:':'😢', ':angry:':'😠', ':rage:':'😡',
    ':fearful:':'😨', ':scream:':'😱', ':dizzy_face:':'😵', ':sleeping:':'😴',
    ':sunglasses:':'😎', ':innocent:':'😇', ':upside_down_face:':'🙃', ':neutral_face:':'😐',
    ':question:':'❓', ':grey_question:':'❔', ':exclamation:':'❗', ':warning:':'⚠️',
    ':white_check_mark:':'✅', ':heavy_check_mark:':'✔️', ':x:':'❌', ':o:':'⭕',
    ':no_entry:':'⛔', ':no_entry_sign:':'🚫', ':information_source:':'ℹ️', ':sos:':'🆘',
    ':computer:':'💻', ':desktop_computer:':'🖥️', ':keyboard:':'⌨️', ':iphone:':'📱',
    ':floppy_disk:':'💾', ':cd:':'💿', ':printer:':'🖨️', ':camera:':'📷',
    ':framed_picture:':'🖼️', ':art:':'🎨', ':movie_camera:':'🎥', ':headphones:':'🎧',
    ':musical_note:':'🎵', ':video_game:':'🎮', ':dart:':'🎯', ':game_die:':'🎲',
    ':hammer_and_wrench:':'🛠️', ':wrench:':'🔧', ':hammer:':'🔨', ':nut_and_bolt:':'🔩',
    ':gear:':'⚙️', ':link:':'🔗', ':paperclip:':'📎', ':lock:':'🔒', ':unlock:':'🔓',
    ':key:':'🔑', ':mag:':'🔍', ':mag_right:':'🔎', ':bar_chart:':'📊',
    ':chart_with_upwards_trend:':'📈', ':chart_with_downwards_trend:':'📉',
    ':calendar:':'📅', ':date:':'📅', ':spiral_calendar:':'🗓️', ':alarm_clock:':'⏰',
    ':hourglass:':'⌛', ':watch:':'⌚', ':stopwatch:':'⏱️',
    ':package:':'📦', ':mailbox:':'📫', ':email:':'📧', ':envelope:':'✉️', ':inbox_tray:':'📥',
    ':outbox_tray:':'📤', ':bank:':'🏦', ':hospital:':'🏥', ':house:':'🏠',
    ':office:':'🏢', ':classical_building:':'🏛️', ':construction:':'🚧',
    ':bus:':'🚌', ':bike:':'🚲', ':car:':'🚗', ':train:':'🚆', ':airplane:':'✈️',
    ':coffee:':'☕', ':tea:':'🍵', ':beer:':'🍺', ':cake:':'🍰', ':birthday:':'🎂',
    ':pizza:':'🍕', ':hamburger:':'🍔', ':rice:':'🍚', ':ramen:':'🍜', ':bento:':'🍱',
    ':apple:':'🍎', ':watermelon:':'🍉', ':strawberry:':'🍓', ':grapes:':'🍇',
    ':meat_on_bone:':'🍖', ':poultry_leg:':'🍗', ':curry:':'🍛', ':stew:':'🍲',
    ':dog:':'🐶', ':cat:':'🐱', ':mouse:':'🐭', ':panda_face:':'🐼', ':penguin:':'🐧',
    ':seedling:':'🌱', ':herb:':'🌿', ':maple_leaf:':'🍁', ':cherry_blossom:':'🌸',
    ':sunflower:':'🌻', ':tulip:':'🌷', ':rose:':'🌹', ':christmas_tree:':'🎄',
    ':snowflake:':'❄️', ':snowman:':'⛄', ':umbrella:':'☔', ':cloud:':'☁️',
    ':earth_asia:':'🌏', ':crescent_moon:':'🌙', ':milky_way:':'🌌',
    ':100:':'💯', ':ok_hand:':'👌', ':v:':'✌️', ':pill:':'💊', ':syringe:':'💉',
    ':money_with_wings:':'💸', ':dollar:':'💵', ':credit_card:':'💳', ':receipt:':'🧾',
    ':shopping_cart:':'🛒', ':shopping:':'🛍️', ':basket:':'🧺',
    ':bug:':'🐛', ':beetle:':'🪲', ':spider:':'🕷️', ':ghost:':'👻', ':alien:':'👽',
    ':robot:':'🤖', ':skull:':'💀', ':recycle:':'♻️', ':on:':'🔛', ':new:':'🆕',
    ':free:':'🆓', ':up:':'🆙', ':cool:':'🆒', ':ng:':'🆖', ':abc:':'🔤', ':1234:':'🔢'
  };

  const SHORTCODE = /:[a-z0-9_+-]+:/g;

  function emojify(value) {
    const text = String(value ?? '');
    if (!text.includes(':')) return text;
    return text.replace(SHORTCODE, (code) => EMOJI[code] || code);
  }

  function escapeHtml(v){return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function fallback(md){
    return escapeHtml(md)
      .replace(/```([\s\S]*?)```/g,(m,c)=>'<pre><code>'+c.trim()+'</code></pre>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>');
  }

  window.communityEmoji = emojify;

  window.communityMarkdownRender = function(md){
    const text = emojify(md);
    if(window.markdownit){
      const parser=window.markdownit({html:false,linkify:true,breaks:true});
      return parser.render(text);
    }
    return fallback(text);
  };
})();
