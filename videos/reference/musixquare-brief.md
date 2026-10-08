# Reference film → reconstructed template (Musixquare launch, "Kframe" watermark)

Source: user upload (Twitter download), 34.07 s, 1920x1080, 59.94 fps, H.264 + AAC stereo.
Measured: 6 hard cuts only (8.44, 8.53, 27.66, 28.43, 29.45, 29.46 s); tempo about 108 BPM (16th-note onsets every 0.139 s);
energy -18 dB intro, drop at 8.0 s (-11 dB), groove to 24 s, breakdown 26-30 s; -10.9 LUFS integrated, peak +1.2 dBFS (a hot social-media mix).
Method: 1 fps contact sheet, 4 fps strips at 6-9.5 s and 17.5-21 s, ffmpeg scene detection, librosa tempo/onsets/RMS, EBU R128.
Honesty: this is a reconstruction from the finished video, not the prompt or project file that made it. The "Kframe" mark suggests a motion
studio built it (most likely by hand in After Effects or similar), not a single AI prompt. Look, fonts and motion type are read by eye.

<inputs>
Brand: Musixquare (app that plays music in sync across devices, with rooms and chat)
URL: the product site, for logo, colours, UI
Logo file: MUSIXQUARE custom geometric logotype + music-note app icon (blue to cyan gradient)
Product UI to show: "Play in Sync" button, Invite your friends screen, Create a Room, QR + invitation code, Join a Room, room with member avatars, now-playing screen, room chat
Footage / photos: lifestyle device photos (tablet on a cafe table, laptop on an orange chair, iPad on a desk, a monitor by a window), a concert video playing inside phones
Song: upbeat electronic/pop, about 108 BPM, with a clear drop at 8 s and a breakdown near the end
Copy: "Turn your Phone / Tablet / Laptop into one Sound System", "Play in Sync", "Connect in Seconds", "Create a Room", "Join a Room", "Perfectly in sync", "Talk while you play", "Try it now"
Reference video: none needed
</inputs>

<direction>
Story in one line: every device you own becomes one speaker; tap Play in Sync, invite friends with a code, listen and chat together.
Look: cool off-white ground, black type, one electric blue to cyan gradient accent; rounded pills, soft shadows, light glass
Type: one bold geometric sans for headlines and UI (accent word in blue), the custom MUSIXQUARE logotype
Accent colour: electric blue (gradient to cyan)
Motion language: continuous morphs, almost no cuts; every element turns into the next (button to rings to logo, dots to icon, icon to phone tunnel)
Effects: kinetic type (word tickers, arrow flips), cursor-driven UI clicks, 3D phone tilts and a kaleidoscope phone tunnel, concentric ripple rings, a 3D mascot peeking over the button, real photos as cards
Never: hard cuts between ideas, dark backgrounds, more than one accent colour
Loop: no (ends on logo + "Try it now", then black)
</direction>

<structure>
Length: 34 s   Aspect: 16:9   Tempo: about 108 BPM
Beats:
1. 0-2 s   Kinetic type: "Turn your →", the arrow flips direction, words re-stack.
2. 2-4 s   Word ticker "Phone / Tablet / Laptop" points at lifestyle photo cards with "Connected" chips.
3. 4-7.5 s "Into one Sound System" (blue accent); a "Play in Sync" pill appears, a 3D mascot peeks over it, the pill tilts; the cursor clicks it.
4. 8.0 s   DROP: the pill bursts into concentric blue pill rings ("Syncing"), collapses, and the note icon morphs into the MUSIXQUARE logo.
5. 10-13 s A tiny phone scales up in a 3D tilt ("Invite your friends"); "Connect in Seconds" with a highlight box; "Create a Room" button.
6. 13-17 s QR code + invitation code 197625, cursor; the code flies into a "Join a Room" field.
7. 17-20 s Loading dots gather into the app icon; member chips (Sora, Julesk, Noa, Minari) orbit it.
8. 20-24 s Zoom through the icon into a kaleidoscope tunnel of phones playing a concert: "Perfectly in sync", "Talk while you play".
9. 24-28 s A phone spins edge-on and lands on the room chat; messages pop in ("wait for the drop", "again!!!", "Turn it up broo", "so good!!").
10. 28-30 s The only hard cuts: real photos of an iPad on a desk and a monitor by a window (other screens).
11. 30-34 s A huge music note pulls back into the logo; "Try it now" button; black.
Drop / quiet moment: drop at 8.0 s on the button click; breakdown 26-30 s under the chat and photo shots.
Ending: MUSIXQUARE logo with a "Try it now" pill.
</structure>

<build>
Sound: licensed or library track plus UI clicks, pops and whooshes on each morph (the mix is loud: -10.9 LUFS, peaks clip at +1.2 dBFS)
Deliverables: mp4 for social (16:9)
(to rebuild it in this studio: Playwright, 60 fps, H.264 CRF 16, -14 LUFS, true peak under -1 dBTP, checks and 8+ scores)
</build>

<gotchas>
- The kaleidoscope phone tunnel and 3D phone tilts are real 3D (After Effects or Cinema 4D); in this studio's code they need a 2D approximation.
- The 3D mascot and the lifestyle device photos are custom assets; they must be supplied.
- The concert footage inside the phones is third-party video; it needs rights.
- The fast 16th-note rhythm means many small hits; place SFX on the measured grid, not by eye.
</gotchas>

<start>
Ask for the logo, UI screens, photos and the track. Then show the beat map and 4 stills for OK before the full film.
</start>
