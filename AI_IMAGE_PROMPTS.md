# Win & Win — AI image generation prompts

Complete production-ready prompts for every visual on winandwin.club. Every prompt keeps the same shared visual grammar so the site ends up feeling cohesive across every touch-point.

Use with **Midjourney v7**, **DALL·E 3**, **Ideogram 3**, **Recraft v3**, **Flux 1.1 Pro**, or **Adobe Firefly 3**. Where the prompt targets a specific model, that's noted; otherwise it's model-agnostic.

---

## 0. Shared visual brief (paste at the top of any prompt to lock the style)

> Sky-blue + navy premium SaaS aesthetic. Palette anchored on `#0369A1` (sky blue), `#020617` (near-black navy), `#F8FAFC` (soft slate white), with warm accents `#F59E0B` and `#EC4899`. Clean, editorial, cinematic. Modern, natural, unforced. Soft window light, gentle rim highlights, shallow depth of field. Feel of a Notion / Linear / Vercel marketing site — high-contrast, minimal noise, professional but human. No stock-photo cheesiness. Real Moroccan and French merchants, real venues, no supermodels. No text overlays unless specified.

Aspect-ratio shortcuts (Midjourney): `--ar 16:9` hero, `--ar 4:5` portrait, `--ar 1:1` square, `--ar 3:4` flyer, `--ar 9:16` phone.

Model tuning tokens:
- **Midjourney**: append `--style raw --stylize 250 --v 7`
- **Flux / Ideogram**: prepend `photorealistic, editorial photography,`
- **DALL·E 3**: prepend `Ultra-realistic photograph,`
- **Recraft v3 (photo)**: use style `realistic_image/studio_portrait` for portraits, `realistic_image/hard_flash` for product

---

## 1. Landing page — `apps/web/src/app/page.tsx`

### 1.1 Hero — right-hand phone-in-hand shot (replaces the current ScratchCard SVG)
**Slot**: `apps/web/src/app/_landing/scratch-card.tsx` → optional real photograph swap
**Aspect**: 4:5 or 3:4

> Editorial marketing photograph of a young Moroccan woman in her late twenties, wearing a soft cream linen shirt, seated at a bright café table in Casablanca. She holds a modern iPhone in both hands. On the phone screen (integrated in-camera, sharp, legible) a gold scratch-card is being revealed with a fingertip — golden foil peels back to expose the words "You won a free coffee" over an emerald green background. Warm natural morning light through a large window, soft golden hour spill, subtle steam rising from a cortado on the table beside her. Cinematic shallow depth of field, 50mm, f/2.0, ISO 200. Delighted, genuine microsmile — not staged. Background is softly blurred café interior with terrazzo tiles and brass accents. Sky-blue and navy tones, warm amber accents. No text on the wall, no logos in frame. --ar 4:5 --style raw --v 7

### 1.2 Trust-bar merchant logos (six pill-shaped brand marks)
**Slot**: `landing-hero.tsx` — `TRUST_LOGOS` array (currently text pills)
**Aspect**: 1:1 each, transparent PNG

> Minimalist premium logo mark for **{merchant name}**, monoline, single colour navy (`#0F172A`), centered on a transparent background. Editorial identity design in the style of a modern brand system — think Aesop, Ace Hotel, Casa Bosques. Subtle geometric mark + small refined wordmark below. No gradients, no drop shadow, no borders. Vector-style clean edges. Suitable for a marketing trust-bar. --ar 1:1 --style raw

Repeat for: Riad Jardin, Café Hafa, Restaurant Al Fassia, Salon Beauté, Pâtisserie Amoud, Gym Atlas.

### 1.3 Optional hero background photo (replaces the CSS blur glows)
**Aspect**: 16:9, subtle enough to sit behind copy

> Ultra-wide editorial photograph of an out-of-focus bustling Moroccan café interior at golden hour — brass fixtures, zellige tile wall softly bokeh'd, a warm sun flare from the right. Colour graded toward pale sky blue and cream, extremely low contrast so it sits behind marketing copy without competing. Grain removed, film emulation, cinematic, calm. No people in frame. Feels like a screensaver, not a stock image. --ar 16:9 --style raw --v 7

---

## 2. "How it works" section — `landing-how.tsx`

Three horizontal thumbnails illustrating step 1, 2, 3. Match the same crop and lighting so they read as a triptych.

### 2.1 Step 1 — "Create your game" (dashboard on laptop)
**Aspect**: 4:3

> Over-the-shoulder photograph of a merchant in their fifties, dark hair with grey streaks, wearing a crisp white apron, sitting at a wooden counter in a Moroccan pâtisserie. On his 13-inch MacBook screen (sharp, integrated, no moiré), a clean SaaS dashboard is visible — a wheel-of-fortune editor with drag-and-drop coloured segments and a live preview panel. The dashboard uses a sky-blue and white palette. Natural morning light, croissants and a brass espresso machine gently blurred in the background. 50mm, shallow depth of field. No visible URL or brand name on the screen. --ar 4:3 --style raw --v 7

### 2.2 Step 2 — "Share your QR" (customer scanning a table QR)
**Aspect**: 4:3

> Close-up marketing photograph of a customer's hand holding an iPhone 15 above a printed QR-code card sitting on a marble café table. The QR is on a clean cream-coloured card with a small "Win & Win" mark bottom-right (barely legible). The camera app is open on the phone showing the QR being read. Warm café ambience in the background — soft bokeh of a barista pulling espresso. 35mm, f/2.2, ISO 400. Sky-blue and cream colour palette, warm amber highlights. --ar 4:3 --style raw --v 7

### 2.3 Step 3 — "Players play and win" (merchant scanning a coupon)
**Aspect**: 4:3

> Editorial photograph of a smiling barista in her thirties, wearing a linen apron, holding an iPad. She's scanning a customer's phone across the counter — the customer's screen shows a bright emerald coupon panel with the words "Free Coffee". Real interaction, genuine expressions, no forced staging. Sky-blue tokens visible on the iPad screen. Warm, welcoming lighting, mid-afternoon window light, background is a softly blurred zellige-tiled wall. 50mm, f/2.5. --ar 4:3 --style raw --v 7

---

## 3. Games showcase — `landing-games.tsx`

The interactive cards themselves are pure CSS/SVG animations. These prompts are for **optional over-illustrations** if a real product photo swap is ever wanted.

### 3.1 Wheel of Fortune illustration
**Aspect**: 1:1

> Isometric 3D render of a premium wheel-of-fortune game, eight brightly coloured segments (magenta, sky blue, emerald, amber, indigo, teal, orange, rose), gold pointer at the top, glossy plastic finish with realistic reflections. Sitting on a soft cloud-like navy background with drifting golden particles. Cinema-4D quality, ray-traced, subsurface scattering on the pointer. Style of an Apple product render — clean, aspirational, tactile. --ar 1:1 --style raw --v 7

### 3.2 Slot Machine illustration
**Aspect**: 1:1

> Isometric 3D render of a compact modern slot machine, brushed amber-gold metal chassis, three glowing white reels showing 7-7-7, brass handle on the side, glowing top marquee bulbs. Sitting on a soft warm sunset gradient background. Cinema-4D quality, ray-traced glass, subtle motion blur on the reels suggesting recent spin. Style of an Apple product render — luxurious, cartoon-adjacent, not casino-sleazy. --ar 1:1 --style raw --v 7

### 3.3 Mystery Box illustration
**Aspect**: 1:1

> Isometric 3D render of a rose-red gift box with a bright yellow ribbon and bow, lid slightly ajar with warm golden light spilling out. Confetti and small icons (coffee cup, star, sparkle) mid-air around the box, frozen in a bounce. Emerald-teal gradient background, soft shadow beneath. Cinema-4D quality, ray-traced, playful, premium. Style of an Apple product render. --ar 1:1 --style raw --v 7

---

## 4. Industries section — `landing-industries.tsx`

Six real merchants, one per vertical. Each replaces the current CSS-gradient flyer mockup with a real environmental portrait. Consistent framing across all six.

### 4.1 Restaurant — "Amine, Café Hafa (Casablanca)"
**Aspect**: 4:5

> Environmental portrait of a Moroccan man in his late 30s, warm smile, wearing a navy apron over a plain white t-shirt, standing behind the polished counter of a Casablanca café. Behind him a chalkboard menu and a brass espresso machine, both softly blurred. He holds a printed QR-code flyer up to the camera — the flyer is emerald green with a bold "Tentez la roue" headline. Natural window light from the left, warm golden hour spill. 50mm, f/2.0, ISO 200. Real, unposed, confident. --ar 4:5 --style raw --v 7

### 4.2 Café — "Salma, Riad Jardin (Marrakech)"
**Aspect**: 4:5

> Environmental portrait of a Moroccan woman in her late 20s in a Marrakech riad courtyard, wearing a cream linen kaftan, standing next to a table with a mint-tea setup. She holds an iPhone showing the Win & Win wheel spinning on screen. Zellige tiled floor visible in the foreground, orange blossom tree softly bokeh'd behind her. Warm afternoon light, slight lens flare from the right. 50mm, f/2.2. Genuine soft smile, calm confidence. --ar 4:5 --style raw --v 7

### 4.3 Salon — "Yasmine, Salon Beauté (Rabat)"
**Aspect**: 4:5

> Environmental portrait of a Moroccan hairstylist in her early 30s, dark hair pulled back, wearing a stylish black smock, standing in front of a large gold-framed mirror in a modern Rabat beauty salon. Soft pink accent wall in the background, brushed brass fixtures, pale marble counter with a printed QR flyer visible. She holds a hair-comb in one hand and gestures welcomingly with the other. Warm ring-light softness. 50mm, f/2.2. --ar 4:5 --style raw --v 7

### 4.4 Gym — "Youssef, Gym Atlas (Casablanca)"
**Aspect**: 4:5

> Environmental portrait of a Moroccan personal trainer in his mid 30s, athletic build, wearing a slate-grey performance polo, standing in front of an indoor gym rig — matte-black dumbbell rack softly out of focus behind him. He holds a tablet showing a colourful QR-code leaderboard on screen. Cool late-afternoon light through frosted windows. Confident direct-to-camera gaze. 50mm, f/2.5, ISO 400. --ar 4:5 --style raw --v 7

### 4.5 Bakery — "Karim, Pâtisserie Amoud (Casablanca)"
**Aspect**: 4:5

> Environmental portrait of a Moroccan pastry chef in his 40s, salt-and-pepper hair, wearing a crisp white chef's coat and a linen apron dusted with flour, standing behind a marble counter piled with fresh croissants and mille-feuilles. A small QR-code tent card sits beside the pastries. Warm bakery light, brass shelving softly out of focus. Genuine tired-but-proud smile. 50mm, f/2.0. --ar 4:5 --style raw --v 7

### 4.6 Retail — "Zineb, Boutique Chic (Rabat)"
**Aspect**: 4:5

> Environmental portrait of a Moroccan boutique owner in her early 30s, minimalist chic style, wearing a beige silk blouse, standing behind the checkout counter of a small designer clothing boutique. On the counter, a printed QR-code stand ("Scannez pour la roue"). Soft neutral palette all around — cream walls, oak shelving, pale pink accent flowers. Bright indirect daylight. 50mm, f/2.2. --ar 4:5 --style raw --v 7

---

## 5. Case studies — `landing-case-studies.tsx`

Currently CSS gradient tiles with initials. When real photos come in, use these prompts to keep the merchant portraits consistent with the industries section above.

### 5.1 Amine El Idrissi — Café Hafa, Casablanca
**Aspect**: 1:1

> Half-body portrait of Amine, a Moroccan man in his late 30s, wearing a navy apron over a white t-shirt, standing behind the counter of Café Hafa. Genuine warm smile, direct-to-camera. Behind him: brass espresso machine, chalkboard, softly bokeh'd. Warm sky-blue and amber colour grade. 85mm, f/2.0, natural window light. --ar 1:1 --style raw --v 7

### 5.2 Salma Meknassi — Salon Beauté, Rabat
**Aspect**: 1:1

> Half-body portrait of Salma, a Moroccan woman in her 30s, wearing a stylish black smock with delicate gold earrings, standing in her modern beauty salon in Rabat. Soft pink accent wall behind her, gold-framed mirror partially visible. Genuine confident smile, direct-to-camera. Warm ring-light softness. 85mm, f/2.0. --ar 1:1 --style raw --v 7

### 5.3 Youssef Bennani — Pâtisserie Amoud, Casablanca
**Aspect**: 1:1

> Half-body portrait of Youssef, a Moroccan pastry chef in his 40s, salt-and-pepper hair, in a crisp white chef's coat, holding a fresh mille-feuille with one hand. Behind him: marble counter with pastries in soft focus. Warm bakery light. Proud calm expression, direct-to-camera. 85mm, f/2.0. --ar 1:1 --style raw --v 7

---

## 6. Dashboard preview — `landing-dashboard-preview.tsx`

The section is animated CSS today. If ever replaced by a real product screenshot render:

### 6.1 Full SaaS dashboard mock
**Aspect**: 16:10

> Ultra-crisp UI mock of a modern SaaS analytics dashboard — the "Win & Win" merchant dashboard. Left sidebar with navy background and glowing sky-blue active state ("Overview" selected). Main canvas on a soft off-white background: four KPI tiles across the top (Users +1,240, Scan rate 68%, Avg rating 4.8★, Coupons redeemed 342), each with a small sparkline. Below, a 7-bar weekly chart in the sky-blue brand colour. On the right, a live activity feed with tiny avatar circles. Typography is Plus Jakarta Sans, generous whitespace. Style of a Vercel / Linear / Notion product screenshot — sharp, aspirational, believable. Rendered as if displayed inside a browser chrome (subtle red-yellow-green dots top-left). No third-party logos, no lorem ipsum. --ar 16:10

### 6.2 Dashboard-in-context photograph (merchant using it)
**Aspect**: 16:9

> Editorial marketing photograph of a MacBook Air on a marble café counter, the dashboard from prompt 6.1 filling the screen. A Moroccan woman's hand — manicured, holding a cortado — enters frame from the right. Soft morning light, subtle depth of field on the background (espresso machine, plants softly bokeh'd). Sky-blue and cream colour grade. 35mm, f/2.5. Feels like a Vercel case-study photograph. --ar 16:9 --style raw --v 7

---

## 7. Battle / comparison table — `landing-battle.tsx`

Doesn't need a photograph. Purely typography and icons.

**Optional accent illustration** (1:1, tucks next to the section title):

> Flat vector illustration of two matchbook-style cards facing off. Left card is Win & Win: navy background with a colourful little wheel-of-fortune icon and a checkmark. Right card is a generic competitor: grey, minimal, with an X. Both cards float above a soft sky-blue circular glow. Style of Notion or Superhuman marketing illustrations — clean, minimal, flat, geometric. --ar 1:1

---

## 8. ROI calculator — `landing-roi-calculator.tsx`

**Optional side illustration** (1:1):

> Isometric 3D render of a stack of gold coins, a small bar chart rising beside it, and a floating calculator icon above. Sky-blue background with soft radial glow. Playful but premium — Apple product illustration energy. Warm gold + navy palette. --ar 1:1 --v 7

---

## 9. Landing quiz modal — `landing-quiz-modal.tsx`

**Question-step icons** (four per question, 1:1, transparent PNG):

Restaurant:
> Minimalist flat vector icon of a Moroccan tagine on a plate, drawn in one continuous stroke, sky-blue line on transparent background. Style of Phosphor icons or Lucide. --ar 1:1

Café:
> Minimalist flat vector icon of a barista espresso cup with a heart in the crema, monoline sky-blue stroke, transparent background. --ar 1:1

Salon:
> Minimalist flat vector icon of a pair of scissors crossed with a comb, monoline sky-blue stroke, transparent background. --ar 1:1

Event:
> Minimalist flat vector icon of a champagne flute with sparkles, monoline sky-blue stroke, transparent background. --ar 1:1

Retail:
> Minimalist flat vector icon of a shopping bag with a small tag, monoline sky-blue stroke, transparent background. --ar 1:1

Gym:
> Minimalist flat vector icon of a dumbbell, monoline sky-blue stroke, transparent background. --ar 1:1

**Result-step celebratory illustration** (1:1):

> Bright celebratory illustration for a quiz result screen — confetti, a sparkle burst, and a small floating wheel-of-fortune in the centre. Flat vector style with subtle gradient shading, sky-blue and amber palette. Playful, fresh, feels like a delightful moment. Transparent background. --ar 1:1

---

## 10. Pricing / plans section — `landing-plans.tsx`

**Optional plan-tier illustrations** (1:1 each):

Starter:
> Isometric 3D render of a small sky-blue paper origami crane on a soft cream background, gentle shadow. Represents entry-level, lightness. Cinema-4D quality. --ar 1:1

Pro:
> Isometric 3D render of a larger navy paper origami crane with sky-blue accents, catching a soft golden light beam. Represents growth. --ar 1:1

Enterprise:
> Isometric 3D render of a majestic golden origami crane in flight against a deep navy background with soft particle glow. Represents scale. --ar 1:1

---

## 11. Contact section — `landing-contact.tsx`

### 11.1 Team-availability photograph
**Aspect**: 3:2

> Editorial marketing photograph of a small friendly startup team of 3–4 young Moroccans in a bright loft office in Casablanca — one on a phone call smiling, another looking at a whiteboard, a third on a MacBook. Warm daylight through a large industrial window, plants in the foreground softly out of focus, exposed brick and light oak surfaces. Feels honest and real, not stock. Sky-blue and cream colour grade. 35mm, f/2.8. No brand logos in frame. --ar 3:2 --style raw --v 7

### 11.2 WhatsApp CTA thumbnail (square, transparent PNG)

> Flat vector illustration of a green WhatsApp phone bubble with a small speech tail, sitting on a soft cream circular background, subtle shadow beneath. Emerald-green `#25D366` accent. Extremely clean, no text. Feels premium and inviting. --ar 1:1

---

## 12. Footer — `landing-footer.tsx`

### 12.1 Small workshop / craftsmanship photograph (subtle, wide)
**Aspect**: 21:9 (extra wide)

> Wide ambient photograph of a Moroccan artisan's workshop at dawn — pale light streaming through slatted shutters, tools softly arranged on a wooden bench, dust motes visible in the light beams. Sky-blue morning colour grade, low contrast. Suitable for use behind a footer as a barely-there texture. No people, no text. --ar 21:9 --style raw --v 7

---

## 13. Sign-in / sign-up backgrounds — `apps/web/src/app/(auth)/**`

Currently the auth pages have no hero image. Two variants (one per page) will give them a premium feel.

### 13.1 Sign-in — welcoming return
**Aspect**: 9:16 (right-side split panel)

> Editorial vertical photograph of a Casablanca café at sunset, warm amber and rose light spilling across the interior, a single seat at the window (empty, welcoming), a cortado on the table, a printed QR-code card next to it. Soft depth of field, cinematic mood, colour graded toward navy shadows and warm highlights. Feels like a "welcome back" moment. --ar 9:16 --style raw --v 7

### 13.2 Sign-up — new beginnings
**Aspect**: 9:16

> Editorial vertical photograph of a Marrakech riad courtyard at sunrise, mint tea steam curling in a shaft of pink dawn light, zellige tile pattern below, an orange blossom tree in the background. Feels aspirational, calm, "a new chapter begins." Colour graded toward navy shadows and warm highlights. --ar 9:16 --style raw --v 7

---

## 14. Dashboard app — `apps/web/src/app/(dashboard)/**`

### 14.1 Empty-state illustrations
For empty tabs (no coupons yet, no players yet, no prizes yet, no games yet). One consistent style across all four.

Empty coupons:
> Flat isometric illustration of a small floating cream-coloured coupon card with a magnifying glass beside it, sky-blue palette, soft shadow beneath. Minimal, whimsical, calm. Transparent background. --ar 1:1

Empty players:
> Flat isometric illustration of three simple silhouetted head-and-shoulder figures floating in a sky-blue soft circle, one holding a small phone. Transparent background, minimal, whimsical. --ar 1:1

Empty prizes:
> Flat isometric illustration of a small gift box, a coffee cup, and a star, arranged in a triangle above a soft sky-blue glow. Transparent background, playful, premium. --ar 1:1

Empty games:
> Flat isometric illustration of a small wheel-of-fortune, a slot machine, and a gift box, arranged in a triangle above a soft sky-blue glow. Transparent background. --ar 1:1

### 14.2 QR-code preview mock (`qr-section.tsx`)
Already generated in-app. No prompt needed.

### 14.3 Settings / avatar placeholder
**Aspect**: 1:1

> Minimalist round avatar placeholder — a soft sky-blue gradient circle with a small centered outline of a smiling face, monoline navy stroke. No text. --ar 1:1

---

## 15. Player app — `apps/player`

### 15.1 Atmosphere backgrounds (one per game variant)
Player game backgrounds already use CSS gradients. If a photographic swap is ever wanted:

Café atmosphere:
> Ultra-blurred abstract photograph of a Moroccan café at dusk — bokeh circles of warm brass light, deep navy shadows, a hint of terracotta. No recognisable objects. Feels like a screensaver behind a game canvas. --ar 9:16 --style raw --v 7

Night / bar atmosphere:
> Ultra-blurred abstract photograph of a rooftop bar at night — string lights turned into large soft bokeh, a hint of magenta and gold, deep navy sky. --ar 9:16 --style raw --v 7

Beach / summer atmosphere:
> Ultra-blurred abstract photograph of a Moroccan beach at golden hour — pale sand bokeh, turquoise water, warm sun flare. Feels like a screensaver. --ar 9:16 --style raw --v 7

Salon atmosphere:
> Ultra-blurred abstract photograph of a modern beauty salon — pale pink walls, gold-framed mirror reflections turned to soft bokeh, warm ring-light glow. --ar 9:16 --style raw --v 7

---

## 16. Social / OG / meta images (Twitter card, LinkedIn preview)

### 16.1 OG image — main landing page
**Aspect**: 1200×630 (approx 16:9)

> Marketing OG-card design: on the left, a bold navy headline "Turn every visit into a return" in Plus Jakarta Sans, semibold, tight leading. Below in smaller sky-blue text: "Win & Win — the QR-code loyalty game for local businesses." On the right, a floating iPhone at a 15° tilt showing a colourful wheel-of-fortune on the screen. Cream-white background with a subtle sky-blue radial glow behind the phone. Small "winandwin.club" wordmark bottom-left. Feels like a Linear OG card. --ar 1200:630

### 16.2 OG image — city landing pages (template)
Same as above with the headline replaced per city (e.g. "In Casablanca, one QR is enough").

### 16.3 Twitter avatar / favicon
**Aspect**: 1:1

> Minimal logo mark — the letters "W" and "W" stylised as two interlocking wheel segments, monoline, sky-blue on a cream circle background. Modern, geometric, timeless. Scales cleanly to 32×32. --ar 1:1

---

## Consistency tips before you generate

1. **Always paste section 0** before your specific prompt — it locks the palette and the vibe.
2. **Keep the same photographer's eye**: 35mm for environmental shots, 50mm for portraits, 85mm for tight portraits.
3. **Always specify** "natural window light" rather than studio lighting — avoids the stock-photo look.
4. **Prefer** real Moroccan/French venues over generic settings.
5. **Reject** any output with visible fake logos, cheesy expressions, over-saturated colours, or text that says "sample"/"example."
6. **When variety is needed** (e.g. six merchants), generate three or four options per prompt and pick the ones whose skin tone, expression, and lighting best match across the set.
7. **Post-process** every image through a light unified LUT (sky-blue shadows, warm highlights) so the whole site feels shot on the same camera.
