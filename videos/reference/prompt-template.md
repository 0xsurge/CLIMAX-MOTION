# Motion film prompt template

How to use: copy everything between the lines, replace each [BRACKET], delete lines marked (optional) you don't need, and paste it into a new message. Anything you leave as a default in (parentheses) is what I will assume.

---

<inputs>
Brand: [name]
URL: [product or site URL, I will capture the real logo, UI, colours and fonts]
Logo file: [uploaded / use the one from the site]
Product UI to show: [list screens, or "capture from the URL"]
Footage / photos: [uploaded files, or "use site images", or "placeholders now, real ones later"]
Song: [uploaded file / "pick one" / "synthesize one"]   (optional)
Copy (exact words on screen): [headline], [3 to 6 short labels], [call to action]
Extra logos (optional): [partners, clients, integrations]
Reference video (optional): [uploaded file, I will extract its structure and match the craft, not copy its brand]
</inputs>

<direction>
Story in one line: [what happens, e.g. "one order ripples through stock, sales and delivery"]
Look: [warm off-white + black UI / cool blue gradient + glass cards / brand colours from the site / other]   (default: the brand's own colours)
Type: [one display face + one UI face]   (default: from the site)
Accent colour: [one colour]   (default: the brand's)
Motion language: [continuous morphs, one camera / hard cuts on the beat / mix]   (default: continuous, no crossfades)
Effects to use: [liquid glass, iris, goo, 3D tilt, cursor-driven UI, none]   (pick any)
Never: [anything you dislike, e.g. "no spins, no glow"]   (house bans always apply: no fades as enters, no slide-show wipes, no dead time)
Loop: [yes, last frame equals first / no]
</direction>

<structure>
Length: [seconds]   (default: 30)
Aspect: [16:9 / 1:1 / 9:16 / all three]   (default: 16:9 plus 1:1 and 9:16 exports)
Tempo: [BPM or "match the song"]
Beats: [list 5 to 10 beats, one line each, e.g. "0-3 s logo forms from a dot", "3-8 s project grid unfolds"]   (or write "you propose", and I will draft a beat map for your OK)
Drop / quiet moment: [where the music peaks and where it breathes]   (optional)
Ending: [final frame, e.g. "logo + URL", "returns to the first frame"]
</structure>

<build>
Render: Playwright + Chromium, window.seek(t), closed-form springs, 60 fps with subframe motion blur, H.264 yuv420p CRF 16.
Sound: [downloaded Mixkit SFX for every event / synthesized / none]   (default: downloaded, placed on the measured beat grid)
Loudness: -14 LUFS, true peak under -1 dBTP.
Checks: contact sheet per beat, pop scan, loop check, frame review, scores 8+ before the full render.
Deliverables: [mp4 + poster + contact sheet]   (default)
</build>

<gotchas>
Known hard parts: [anything you already know, e.g. "need real photos, wall footage is a placeholder"]   (optional)
Licences: [say if any footage/song/fonts are restricted]   (optional)
</gotchas>

<start>
Ask me for anything still missing. Then show the beat map and 4 stills for my OK before writing the full film.
</start>

---

Minimum to get started: Brand, URL, Length, Aspect, and "you propose" for Beats. Everything else has a default.
