/*  oraimo SpaceBuds Neo+ "Beyond the noise."  Storyboard B, as an editable After Effects project.
    For After Effects 2022 (and newer).

    HOW TO RUN
    1. Install the three fonts in the "fonts" folder (Inter Display Medium, SemiBold, Bold).
    2. Keep this file inside the ae-kit folder, next to "footage" and "audio".
    3. In After Effects: File > Scripts > Run Script File... and choose this file.

    WHAT YOU GET
    - A folder of footage (photos, oraimo product renders, logo) and the audio (voiceover; music with the sound effects).
    - Twelve scene comps (S00 to S11), each 1920x1080, with live text, shapes, photos and product renders on their own layers.
    - MAIN: the scenes on one timeline with the transitions keyframed (push through, slides, pull-outs, the two light sweeps),
      the voice and music, and a marker for every voice line. The rendered film is added as a hidden GUIDE layer if found.
    Every keyframe uses ease in and out so the moves start soft and land soft; retime anything you like.
*/
(function () {
    app.beginUndoGroup("Build SpaceBuds Neo+");
    var KIT = File($.fileName).parent;
    function f(rel) { return new File(KIT.fsName + "/" + rel); }
    var FPS = 30, DUR = 46, W = 1920, H = 1080;
    var LIME = [130/255, 230/255, 0], LIME_L = [182/255, 1, 77/255], INK = [17/255, 19/255, 24/255], MUTE = [90/255, 96/255, 104/255];
    var WHITE = [1, 1, 1], PAPER = [244/255, 247/255, 236/255], DARK = [6/255, 8/255, 7/255], RED = [1, 69/255, 58/255];
    var F_MED = "InterDisplay-Medium", F_SEMI = "InterDisplay-SemiBold", F_BOLD = "InterDisplay-Bold";

    var proj = app.project || app.newProject();
    var root = proj.items.addFolder("SpaceBuds Neo+ (Storyboard B)");
    var fFoot = proj.items.addFolder("Footage"); fFoot.parentFolder = root;
    var fScenes = proj.items.addFolder("Scenes"); fScenes.parentFolder = root;

    // ---------- footage ----------
    var cache = {};
    function foot(rel) {
        if (cache[rel]) return cache[rel];
        var file = f(rel); if (!file.exists) { alert("Missing file: " + rel); return null; }
        var it = proj.importFile(new ImportOptions(file)); it.parentFolder = fFoot; cache[rel] = it; return it;
    }
    // ---------- helpers ----------
    function comp(name, dur) { var c = proj.items.addComp(name, W, H, 1, dur, FPS); c.parentFolder = fScenes; c.bgColor = DARK; return c; }
    function ease(prop) { // soft in and out on every key (close to the film's camera curve)
        for (var k = 1; k <= prop.numKeys; k++) {
            var dims = (prop.value instanceof Array) ? prop.value.length : 1; var e = [];
            if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) dims = 1;
            for (var d = 0; d < dims; d++) e.push(new KeyframeEase(0, 80));
            try { prop.setTemporalEaseAtKey(k, e, e); } catch (err) {}
        }
    }
    function keys(prop, times, values) { for (var i = 0; i < times.length; i++) prop.setValueAtTime(times[i], values[i]); ease(prop); }
    function bg(c, color) { var s = c.layers.addSolid(color, "Ground", W, H, 1, c.duration); s.locked = false; return s; }
    function gradientGround(c, a, b) { // soft radial ground, the film's lime "world"
        var s = bg(c, a); var g = s.Effects.addProperty("ADBE Ramp");
        g.property("ADBE Ramp-0001").setValue([1350, 380]); g.property("ADBE Ramp-0002").setValue([255/255, 255/255, 255/255]);
        g.property("ADBE Ramp-0003").setValue([700, 1500]); g.property("ADBE Ramp-0004").setValue(b); g.property("ADBE Ramp-0005").setValue(2); return s;
    }
    function photo(c, rel, focusX, focusY, pushFrom, pushTo) { // full-frame photo, covering the frame, with a slow push-in
        var it = foot(rel); if (!it) return null; var l = c.layers.add(it);
        var sc = Math.max(W / it.width, H / it.height) * 100; l.property("Scale").setValue([sc, sc]);
        var ox = (0.5 - (focusX || .5)) * (it.width * sc / 100 - W), oy = (0.5 - (focusY || .5)) * (it.height * sc / 100 - H);
        l.property("Position").setValue([W / 2 + ox, H / 2 + oy]);
        keys(l.property("Scale"), [0, c.duration], [[sc * (pushFrom || 1), sc * (pushFrom || 1)], [sc * (pushTo || 1.05), sc * (pushTo || 1.05)]]);
        return l;
    }
    function shadeBottom(c) { // a calm dark band under the type on photographs (black, wiped soft from the top)
        var s = c.layers.addSolid([0, 0, 0], "Type shade", W, H, 1, c.duration); s.property("Opacity").setValue(55);
        var lw = s.Effects.addProperty("ADBE Linear Wipe"); lw.property("ADBE Linear Wipe-0001").setValue(52); lw.property("ADBE Linear Wipe-0002").setValue(0); lw.property("ADBE Linear Wipe-0003").setValue(420); return s;
    }
    function text(c, str, size, color, x, y, font, just, tracking) {
        var l = c.layers.addText(str); var tp = l.property("Source Text"); var td = tp.value;
        td.resetCharStyle(); td.fontSize = size; td.fillColor = color; try { td.font = font || F_SEMI; } catch (e) {}
        td.justification = just || ParagraphJustification.LEFT_JUSTIFY; td.tracking = (tracking === undefined) ? -25 : tracking; td.applyFill = true; td.applyStroke = false;
        td.leading = size * 1.04; tp.setValue(td); l.property("Position").setValue([x, y]); return l;
    }
    function wordsIn(l, tIn, perWord, tOut) { // the film's type build: word by word from blur and below; out with blur
        try {
            var an = l.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator"); an.name = "Words in";
            var pr = an.property("ADBE Text Animator Properties");
            pr.addProperty("ADBE Text Opacity").setValue(0); pr.addProperty("ADBE Text Position 3D").setValue([0, 36, 0]); pr.addProperty("ADBE Text Blur").setValue([12, 12]);
            var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var adv = sel.property("ADBE Text Range Advanced"); adv.property("ADBE Text Range Type2").setValue(3); adv.property("ADBE Text Range Shape").setValue(1);
            var n = l.property("Source Text").value.text.split(/\s+/).length;
            keys(sel.property("ADBE Text Percent Offset"), [tIn, tIn + perWord * n + .25], [0, 100]);
            if (tOut) { var o = l.property("Opacity"); keys(o, [tOut, tOut + .25], [100, 0]);
                var b = l.Effects.addProperty("ADBE Gaussian Blur 2"); keys(b.property("ADBE Gaussian Blur 2-0001"), [tOut, tOut + .25], [0, 14]); }
        } catch (e) {}
        return l;
    }
    function rect(c, name, w, h, r, color, x, y, shadow) { // a rounded card or pill as a shape layer
        var l = c.layers.addShape(); l.name = name; var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var v = g.property("ADBE Vectors Group"); var rr = v.addProperty("ADBE Vector Shape - Rect"); rr.property("ADBE Vector Rect Size").setValue([w, h]); rr.property("ADBE Vector Rect Roundness").setValue(r);
        var fl = v.addProperty("ADBE Vector Graphic - Fill"); fl.property("ADBE Vector Fill Color").setValue(color);
        l.property("Position").setValue([x, y]);
        if (shadow) { var ds = l.Effects.addProperty("ADBE Drop Shadow"); ds.property("ADBE Drop Shadow-0002").setValue(28); ds.property("ADBE Drop Shadow-0004").setValue(26); ds.property("ADBE Drop Shadow-0005").setValue(60); ds.property("ADBE Drop Shadow-0003").setValue(180); }
        return l;
    }
    function ellipse(c, name, w, h, color, x, y, stroke) {
        var l = c.layers.addShape(); l.name = name; var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group"); var v = g.property("ADBE Vectors Group");
        v.addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([w, h]);
        if (stroke) { var st = v.addProperty("ADBE Vector Graphic - Stroke"); st.property("ADBE Vector Stroke Color").setValue(color); st.property("ADBE Vector Stroke Width").setValue(stroke); }
        else v.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(color);
        l.property("Position").setValue([x, y]); return l;
    }
    function popIn(l, t0, tOut) { // tags and cards: rise from blur with a little scale
        var s = l.property("Scale").value; keys(l.property("Scale"), [t0, t0 + .45], [[s[0] * .86, s[1] * .86], s]);
        keys(l.property("Opacity"), tOut ? [t0, t0 + .3, tOut, tOut + .25] : [t0, t0 + .3], tOut ? [0, 100, 100, 0] : [0, 100]);
        var p = l.property("Position").value; keys(l.property("Position"), [t0, t0 + .45], [[p[0], p[1] + 40], p]);
    }
    function tag(c, label, x, y, iconColor, t0, tOut) { // a white floating tag: pill + dot + label, grouped by parenting
        var w = 110 + label.length * 21; var bgl = rect(c, "Tag " + label, w, 78, 22, WHITE, x + w / 2, y + 39, true);
        var dot = ellipse(c, "Tag dot", 30, 30, iconColor, x + 42, y + 39); var tl = text(c, label, 38, INK, x + 72, y + 52, F_SEMI, null, 0);
        dot.parent = bgl; tl.parent = bgl; popIn(bgl, t0, tOut); return { bg: bgl, label: tl, dot: dot };
    }
    function img(c, rel, x, y, scale) { var it = foot(rel); if (!it) return null; var l = c.layers.add(it); l.property("Position").setValue([x, y]); l.property("Scale").setValue([scale, scale]); return l; }
    function product(c, rel, x, y, scale, t0) { // a real oraimo render with a soft shadow and a slow float
        var l = img(c, rel, x, y, scale); if (!l) return null; var ds = l.Effects.addProperty("ADBE Drop Shadow"); ds.property("ADBE Drop Shadow-0002").setValue(35); ds.property("ADBE Drop Shadow-0004").setValue(40); ds.property("ADBE Drop Shadow-0005").setValue(70);
        l.property("Position").expression = "value + [0, 8*Math.sin(time*1.3)]"; l.property("Rotation").expression = "1.5*Math.sin(time*0.7)";
        if (t0 !== undefined) { keys(l.property("Scale"), [t0, t0 + .7], [[scale * .6, scale * .6], [scale, scale]]); keys(l.property("Opacity"), [t0, t0 + .3], [0, 100]); }
        return l;
    }
    function cardPhoto(c, rel, x, y, w, h, t0) { // a photo as a rounded card (track matte with a rounded rectangle)
        var it = foot(rel); if (!it) return null; var l = c.layers.add(it); var sc = Math.max(w / it.width, h / it.height) * 100; l.property("Scale").setValue([sc, sc]); l.property("Position").setValue([x, y]);
        var m = rect(c, "Card matte", w, h, 22, WHITE, x, y, false); m.moveBefore(l); l.trackMatteType = TrackMatteType.ALPHA; return l;
    }

    // ---------- the twelve scenes ----------
    var S = [];
    // S00 0-2.75: "Your day is loud." on the lime world, the case turning beside it, a photo pill in the sentence
    var c0 = comp("S00 Your day is loud", 3.2); gradientGround(c0, PAPER, [221/255, 239/255, 196/255]);
    wordsIn(text(c0, "Your day is", 104, INK, 150, 520, F_SEMI), 0, .12);
    wordsIn(text(c0, "loud.", 104, LIME, 150, 626, F_SEMI), .36, .12);
    var pill = cardPhoto(c0, "footage/photos/alapere.jpg", 520, 592, 200, 94, 0);
    product(c0, "footage/product/case_only.png", 1460, 560, 95, .2);
    S.push(c0);
    // S01 2.75-6.0: Lagos, loud. Noise tags pinned to the street
    var c1 = comp("S01 Lagos loud", 3.6); photo(c1, "footage/photos/alapere.jpg", .5, .55, 1.0, 1.05); shadeBottom(c1);
    var t1 = tag(c1, "82 dB", 330, 470, RED, .25); var t2 = tag(c1, "76 dB", 1180, 640, RED, .6); var t3 = tag(c1, "88 dB", 820, 250, RED, .95);
    wordsIn(text(c1, "Traffic. Crowds. All at once.", 56, WHITE, 120, 920, F_SEMI), .05, .14);
    // under the light sweep the meters read Quiet
    var tts = [t1, t2, t3]; for (var q = 0; q < 3; q++) { var st = tts[q].label.property("Source Text"); var td0 = st.value; st.setValueAtTime(0, td0); var td1 = st.value; td1.text = "Quiet"; st.setValueAtTime(2.8, td1);
        tts[q].dot.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property(2).property("ADBE Vector Fill Color").setValueAtTime(2.8, [47/255, 168/255, 0]); }
    S.push(c1);
    // S02 6.0-11.8: the quiet lime world, the buds, the Hybrid ANC card switching on
    var c2 = comp("S02 One touch Quiet", 6.2); gradientGround(c2, PAPER, [221/255, 239/255, 196/255]);
    wordsIn(text(c2, "One touch.", 104, INK, 140, 430, F_SEMI), .35, .16); wordsIn(text(c2, "Quiet.", 104, LIME, 140, 536, F_SEMI), .7, .16);
    product(c2, "footage/product/buds_pair.png", 1380, 470, 80, .1);
    var anc = rect(c2, "ANC card", 760, 250, 34, WHITE, 530, 765, true); popIn(anc, 3.0, 5.8);
    var a1 = text(c2, "Hybrid ANC", 44, INK, 194, 735, F_SEMI, null, 0); a1.parent = anc; var a2 = text(c2, "Wherever you are.", 34, MUTE, 194, 790, F_MED, null, 0); a2.parent = anc;
    var tgl = rect(c2, "ANC toggle", 150, 82, 41, [217/255, 220/255, 214/255], 785, 765, false); tgl.parent = anc;
    tgl.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property(2).property("ADBE Vector Fill Color").setValueAtTime(3.6, [217/255, 220/255, 214/255]);
    tgl.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property(2).property("ADBE Vector Fill Color").setValueAtTime(3.95, LIME);
    var knob = ellipse(c2, "ANC knob", 70, 70, WHITE, 745, 765); knob.parent = anc; keys(knob.property("Position"), [3.65, 3.95], [knob.property("Position").value, [knob.property("Position").value[0] + 68, knob.property("Position").value[1]]]);
    S.push(c2);
    // S03 11.8-16.0: Sound360 on a walk: lime rings ripple out from the listener's head
    var c3 = comp("S03 Sound360", 4.8); photo(c3, "footage/photos/crosswalk.jpg", .5, .4, 1.0, 1.06); shadeBottom(c3);
    for (var r = 0; r < 4; r++) { var e = ellipse(c3, "Ring " + (r + 1), 120, 48, LIME_L, 960, 330, 4);
        e.property("Scale").expression = "var p=((time-0.5)*0.55+" + (r / 4) + ")%1; [100+p*1400,100+p*1400]"; e.property("Opacity").expression = "var p=((time-0.5)*0.55+" + (r / 4) + ")%1; time<0.5?0:(1-p)*90"; }
    tag(c3, "Sound360 spatial audio", 120, 110, LIME, .7, 3.95);
    wordsIn(text(c3, "All around", 104, WHITE, 120, 880, F_SEMI), 1.2, .18); wordsIn(text(c3, "you.", 104, LIME, 690, 880, F_SEMI), 1.6, .18);
    S.push(c3);
    // S04 16.0-19.8: thirty hours: the walk and the night joined by a lime line; the case on the line; the counter
    var c4 = comp("S04 Thirty hours", 4.2); gradientGround(c4, PAPER, [221/255, 239/255, 196/255]);
    cardPhoto(c4, "footage/photos/crosswalk.jpg", 360, 546, 520, 292); cardPhoto(c4, "footage/photos/rain.jpg", 1560, 546, 520, 292);
    var ln = c4.layers.addShape(); ln.name = "Line"; var lg = ln.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var pth = lg.addProperty("ADBE Vector Shape - Group"); var sh = new Shape(); sh.vertices = [[620, 546], [1300, 546]]; sh.closed = false; pth.property("ADBE Vector Shape").setValue(sh);
    var ls = lg.addProperty("ADBE Vector Graphic - Stroke"); ls.property("ADBE Vector Stroke Color").setValue(LIME); ls.property("ADBE Vector Stroke Width").setValue(8); ls.property("ADBE Vector Stroke Line Cap").setValue(2);
    var tr = ln.property("ADBE Root Vectors Group").addProperty("ADBE Vector Filter - Trim"); keys(tr.property("ADBE Vector Trim End"), [.6, 2.0], [0, 100]); ln.property("Position").setValue([0, 0]); ln.property("Anchor Point").setValue([0, 0]);
    var gl = ln.Effects.addProperty("ADBE Glo2");
    product(c4, "footage/product/hero_cut.png", 960, 560, 62, .25);
    var cnt = text(c4, "0 h", 190, INK, 960, 280, F_BOLD, ParagraphJustification.CENTER_JUSTIFY, -40);
    cnt.property("Source Text").expression = "Math.round(linear(time, 0.8, 2.3, 0, 30)) + ' h'"; popIn(cnt, .4, 3.7);
    wordsIn(text(c4, "First stop", 40, MUTE, 100, 750, F_SEMI, null, 0), .6, .1); wordsIn(text(c4, "Last stop", 40, MUTE, 1300, 750, F_SEMI, null, 0), 1.2, .1);
    S.push(c4);
    // S05 19.8-23.8: a call: wind falls away, the voice stays; Mic 1 and Mic 2
    var c5 = comp("S05 Clear calls", 4.9); photo(c5, "footage/photos/call.jpg", .4, .5, 1.0, 1.05);
    var vc = rect(c5, "Voice card", 740, 360, 34, WHITE, 1420, 480, true); popIn(vc, .6, 3.95);
    var v1 = text(c5, "Voice, not wind", 40, INK, 1090, 360, F_SEMI, null, 0); v1.parent = vc;
    var wave = c5.layers.addShape(); wave.name = "Voice line"; var wg = wave.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var wp = wg.addProperty("ADBE Vector Shape - Group"); var ws = new Shape(); var vs = []; for (var k = 0; k <= 44; k++) vs.push([1090 + k * 15, 480 + 34 * Math.sin(k * .45) * Math.sin(k * .07 + 1)]); ws.vertices = vs; ws.closed = false; wp.property("ADBE Vector Shape").setValue(ws);
    var wst = wg.addProperty("ADBE Vector Graphic - Stroke"); wst.property("ADBE Vector Stroke Color").setValue(LIME); wst.property("ADBE Vector Stroke Width").setValue(7);
    wave.property("Position").setValue([0, 0]); wave.property("Anchor Point").setValue([0, 0]); wave.parent = vc;
    var m1 = rect(c5, "Mic 1", 150, 56, 28, INK, 1165, 600, false); m1.parent = vc; var m1t = text(c5, "Mic 1", 30, WHITE, 1120, 611, F_SEMI, null, 0); m1t.parent = vc;
    var m2 = rect(c5, "Mic 2", 150, 56, 28, INK, 1330, 600, false); m2.parent = vc; var m2t = text(c5, "Mic 2", 30, WHITE, 1285, 611, F_SEMI, null, 0); m2t.parent = vc;
    wordsIn(text(c5, "Two mics. Every call clear.", 56, WHITE, 120, 160, F_SEMI), .8, .14);
    S.push(c5);
    // S06 23.8-26.0: a gamer; the camera pushes toward his phone as the light sweep rises
    var c6 = comp("S06 Gamer", 2.6); var g6 = photo(c6, "footage/photos/gamer.jpg", .5, .45, 1.0, 1.0);
    var gs = g6.property("Scale").value; g6.property("Scale").removeKey(2); g6.property("Scale").removeKey(1); keys(g6.property("Scale"), [1.5, 2.6], [gs, [gs[0] * 1.5, gs[1] * 1.5]]);   // push toward his phone under the sweep
    tag(c6, "Game mode", 1240, 330, LIME, .6, 2.0);
    S.push(c6);
    // S07 26.0-27.8: the game on the phone, low latency
    var c7 = comp("S07 Game mode", 2.2); bg(c7, DARK);
    rect(c7, "Phone frame", 900, 440, 64, [42/255, 44/255, 48/255], 960, 520, true); cardPhoto(c7, "footage/product/game_screen.jpg", 960, 520, 876, 416);
    tag(c7, "Low latency", 1250, 220, LIME, .5);
    wordsIn(text(c7, "Every sound on time.", 56, WHITE, 960, 880, F_SEMI, ParagraphJustification.CENTER_JUSTIFY), .8, .14);
    S.push(c7);
    // S08 27.8-32.0: rain and sweat
    var c8 = comp("S08 IPX4", 4.7); photo(c8, "footage/photos/rain.jpg", .6, .5, 1.0, 1.06); shadeBottom(c8);
    product(c8, "footage/product/ipx4_cut.png", 1320, 520, 95, .2); tag(c8, "IPX4", 120, 110, LIME, .6, 3.95);
    wordsIn(text(c8, "Sweat. Rain.", 104, WHITE, 120, 850, F_SEMI), .8, .16); wordsIn(text(c8, "Every day.", 104, LIME, 120, 956, F_SEMI), 1.2, .16);
    S.push(c8);
    // S09 32.0-35.8: the whole day folds into one case
    var c9 = comp("S09 One case", 4.2); gradientGround(c9, PAPER, [221/255, 239/255, 196/255]);
    var COLL = ["alapere.jpg", "city.jpg", "crosswalk.jpg", "sky.jpg", "call.jpg", "gamer.jpg", "run.jpg", "smile.jpg", "closed.jpg", "idumota.jpg"];
    for (var i = 0; i < COLL.length; i++) { var a = i / COLL.length * Math.PI * 2 + .4; var cl = cardPhoto(c9, "footage/photos/" + COLL[i], 960, 600, 300, 360);
        var mt = c9.layer(cl.index - 1); var nul = c9.layers.addNull(); nul.name = "Collage " + (i + 1); cl.parent = nul; mt.parent = nul; nul.property("Position").setValue([960, 600]);
        keys(nul.property("Position"), [.2 + i * .05, 1.0 + i * .05, 2.2, 2.9], [[960 + Math.cos(a) * 1300, 600 + Math.sin(a) * 700], [960 + Math.cos(a) * 460, 600 + Math.sin(a) * 260], [960 + Math.cos(a + .4) * 430, 600 + Math.sin(a + .4) * 240], [960, 640]]);
        keys(nul.property("Scale"), [2.2, 2.9], [[100, 100], [8, 8]]); keys(nul.property("Rotation"), [.2, 2.9], [Math.sin(a) * 14, 0]); }
    var hero = cardPhoto(c9, "footage/photos/rain.jpg", 960, 600, 640, 360);
    product(c9, "footage/product/case_only.png", 960, 640, 95, 1.3);
    wordsIn(text(c9, "Your whole day, in one case.", 56, INK, 960, 170, F_SEMI, ParagraphJustification.CENTER_JUSTIFY), .5, .12);
    S.push(c9);
    // S10 35.8-40.4: open it, connected
    var c10 = comp("S10 Connected", 5.5); var p10 = photo(c10, "footage/photos/curly.jpg", .5, .35, 1.0, 1.04); var bl = p10.Effects.addProperty("ADBE Gaussian Blur 2"); bl.property("ADBE Gaussian Blur 2-0001").setValue(36);
    var ph = rect(c10, "Phone", 420, 860, 62, [42/255, 44/255, 48/255], 1390, 540, true); var scr = rect(c10, "Screen", 398, 838, 52, [242/255, 242/255, 247/255], 1390, 540, false); scr.parent = ph;
    var r1 = text(c10, "Bluetooth", 22, INK, 1390, 190, F_SEMI, ParagraphJustification.CENTER_JUSTIFY, 0); r1.parent = ph;
    var row = rect(c10, "Device row", 366, 54, 12, WHITE, 1390, 340, false); row.parent = ph; var rn = text(c10, "oraimo SpaceBuds Neo+", 17, INK, 1222, 346, F_MED, null, 0); rn.parent = ph;
    var rs = text(c10, "Not Connected", 15, [142/255, 142/255, 147/255], 1556, 346, F_MED, ParagraphJustification.RIGHT_JUSTIFY, 0); rs.parent = ph;
    var std = rs.property("Source Text"); var d0 = std.value; std.setValueAtTime(0, d0); var d1 = std.value; d1.text = "Connected"; d1.fillColor = [36/255, 138/255, 61/255]; std.setValueAtTime(2.5, d1);
    keys(ph.property("Position"), [.3, 1.0], [[1390, 740], [1390, 540]]); keys(ph.property("Opacity"), [.3, .6], [0, 100]);
    product(c10, "footage/product/hero_cut.png", 760, 800, 60, .4);
    wordsIn(text(c10, "Open it.", 104, WHITE, 120, 460, F_SEMI), .6, .14); wordsIn(text(c10, "Connected.", 104, LIME, 120, 566, F_SEMI), 2.4, .14);
    S.push(c10);
    // S11 40.4-46: the logo on the lime glow
    var c11 = comp("S11 Logo", 6.0); var gg = bg(c11, DARK); var rp = gg.Effects.addProperty("ADBE Ramp");
    rp.property("ADBE Ramp-0001").setValue([960, 1240]); rp.property("ADBE Ramp-0002").setValue(LIME); rp.property("ADBE Ramp-0003").setValue([960, 420]); rp.property("ADBE Ramp-0004").setValue(DARK); rp.property("ADBE Ramp-0005").setValue(2);
    var logo = img(c11, "footage/brand/logo_lime.png", 960, 440, 31); keys(logo.property("Scale"), [.7, 1.4, 5.6], [[12, 12], [31, 31], [33, 33]]); keys(logo.property("Opacity"), [.7, 1.0], [0, 100]);
    var lb = logo.Effects.addProperty("ADBE Gaussian Blur 2"); keys(lb.property("ADBE Gaussian Blur 2-0001"), [.7, 1.4], [20, 0]);
    wordsIn(text(c11, "SpaceBuds Neo+", 52, WHITE, 960, 640, F_SEMI, ParagraphJustification.CENTER_JUSTIFY), 1.5, .15);
    wordsIn(text(c11, "Beyond the noise.", 44, LIME, 960, 720, F_SEMI, ParagraphJustification.CENTER_JUSTIFY, 0), 2.0, .12);
    S.push(c11);

    // ---------- MAIN: scenes on one timeline, transitions keyframed ----------
    var main = proj.items.addComp("MAIN SpaceBuds Neo+ Beyond the noise", W, H, 1, DUR, FPS); main.parentFolder = root; main.bgColor = DARK;
    var IN = [0, 2.75, 6.0, 11.4, 16.0, 19.4, 23.4, 26.0, 27.4, 32.0, 35.4, 40.0];   // scene start times (slides overlap the scene before)
    var L = [];
    for (var s = S.length - 1; s >= 0; s--) { var lay = main.layers.add(S[s]); lay.startTime = IN[s]; L[s] = lay; }
    function slide(out, inn, t, dx, dy, d) { // the next panel slides in beside the current one; the camera pans across (fridge film)
        var a = out.property("Position").valueAtTime(t, false), b = inn.property("Position").valueAtTime(t + d, false);
        keys(out.property("Position"), [t, t + d], [a, [a[0] - dx, a[1] - dy]]); keys(inn.property("Position"), [t, t + d], [[b[0] + dx, b[1] + dy], b]); }
    // 1. push through the photo pill into Lagos (2.2-2.75)
    L[0].property("Anchor Point").setValue([520, 592]); L[0].property("Position").setValue([520, 592]);
    keys(L[0].property("Position"), [2.1, 2.75], [[520, 592], [960, 540]]); keys(L[0].property("Scale"), [2.1, 2.75], [[100, 100], [1250, 1250]]);
    keys(L[1].property("Scale"), [2.75, 3.4], [[118, 118], [104, 104]]);
    // 2. the light sweep at 6.0 (see the SWEEP layers below)
    // 3. slide down to the walk (11.4-12.2)
    slide(L[2], L[3], 11.4, 0, 1080, .8);
    // 4. pull out of the walk into its card (16.0): the 30-hours scene starts zoomed on the left card and pulls back
    L[4].property("Anchor Point").setValue([360, 546]); L[4].property("Position").setValue([960, 540]); keys(L[4].property("Scale"), [16.0, 16.8], [[391, 391], [100, 100]]);
    keys(L[4].property("Position"), [16.0, 16.8], [[960, 540], [360, 546]]);
    // 5. slide down to the call; 6. across to the gamer; 8. up to the rain
    slide(L[4], L[5], 19.4, 0, 1080, .8); slide(L[5], L[6], 23.4, 1920, 0, .8); slide(L[7], L[8], 27.4, 0, -1080, .8);
    // 9. pull out of the rain into its card in the collage (32.0)
    L[9].property("Anchor Point").setValue([960, 600]); L[9].property("Position").setValue([960, 540]);
    keys(L[9].property("Scale"), [32.0, 32.8], [[318, 318], [100, 100]]); keys(L[9].property("Position"), [32.0, 32.8], [[960, 540], [960, 600]]);
    // 10. across to the phone; 11. up to the logo
    slide(L[9], L[10], 35.4, 1920, 0, .8); slide(L[10], L[11], 40.0, 0, -1080, .8);
    // the light sweeps (fridge style): a line of light rises; below it the picture takes a lime duotone; under it the scene changes;
    // then the new scene settles back to true colour from the floor up
    function sweep(tc) {
        var adj = main.layers.addSolid([1, 1, 1], "SWEEP " + tc + " s (duotone)", W, H, 1, 3.2); adj.adjustmentLayer = true; adj.startTime = tc - 1.4;
        var tt = adj.Effects.addProperty("ADBE Tritone"); tt.property("ADBE Tritone-0001").setValue([1, 1, .93]); tt.property("ADBE Tritone-0002").setValue([.36, .8, .02]); tt.property("ADBE Tritone-0003").setValue([.03, .16, .02]);
        var lw = adj.Effects.addProperty("ADBE Linear Wipe"); lw.property("ADBE Linear Wipe-0002").setValue(0); lw.property("ADBE Linear Wipe-0003").setValue(220);
        keys(lw.property("ADBE Linear Wipe-0001"), [tc - 1.4, tc], [100, 0]);     // rises from the bottom
        var lw2 = adj.Effects.addProperty("ADBE Linear Wipe"); lw2.property("ADBE Linear Wipe-0002").setValue(180); lw2.property("ADBE Linear Wipe-0003").setValue(260);
        keys(lw2.property("ADBE Linear Wipe-0001"), [tc + .1, tc + 1.6], [0, 100]); // settles back, floor first
        var line = main.layers.addSolid(LIME_L, "SWEEP " + tc + " s (light line)", W, 14, 1, 1.5); line.startTime = tc - 1.4; line.blendingMode = BlendingMode.ADD;
        var lgl = line.Effects.addProperty("ADBE Glo2"); keys(line.property("Position"), [tc - 1.4, tc], [[960, 1100], [960, -20]]); keys(line.property("Opacity"), [tc - 1.4, tc - 1.2, tc - .2, tc], [0, 90, 90, 0]);
    }
    sweep(6.0); sweep(26.0);
    // audio
    var vo = foot("audio/voiceover.wav"), mu = foot("audio/music_and_sfx.wav");
    if (mu) { var ml = main.layers.add(mu); ml.name = "Music + SFX"; ml.moveToEnd(); }
    if (vo) { var vl = main.layers.add(vo); vl.name = "Voiceover (Kokoro, voice 7)"; vl.moveToEnd(); }
    var LINES = [[0.3, "Your day is loud."], [2.6, "Traffic. Crowds. Everyone, all at once."], [6.2, "One touch, and it's quiet."], [9.2, "Hybrid noise cancelling, wherever you are."],
        [12.48, "Sound360 puts the music all around you."], [16.88, "Up to thirty hours, from first stop to last."], [20.5, "Two mics keep every call clear."], [24.3, "Game mode keeps every sound on time."],
        [28.3, "Built for sweat, rain, and every day."], [32.3, "Your whole day, in one case."], [36.3, "Open it, and you're connected."], [41.0, "oraimo. Beyond the noise."]];
    for (var m = 0; m < LINES.length; m++) main.markerProperty.setValueAtTime(LINES[m][0], new MarkerValue(LINES[m][1]));
    // the rendered film as a hidden guide, if it is next to this kit
    var gf = new File(KIT.parent.fsName + "/delivery/oraimo-spacebuds-neo-b.mp4");
    if (gf.exists) { var gi = proj.importFile(new ImportOptions(gf)); gi.parentFolder = fFoot; var gl2 = main.layers.add(gi); gl2.name = "GUIDE rendered film (hidden)"; gl2.guideLayer = true; gl2.enabled = false; gl2.audioEnabled = false; gl2.moveToBeginning(); }
    main.openInViewer();
    app.endUndoGroup();
    alert("SpaceBuds Neo+ is built: open MAIN. Scenes are in the Scenes folder. Install the Inter Display fonts if the type looks wrong.");
})();
