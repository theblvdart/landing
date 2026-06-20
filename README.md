# THE BLVD — site

A static site (Home, The Radar, Journal, Source) with a free, no-code content
admin panel built in. No framework, no build step, no monthly platform fee.

## File map

```
index.html          Homepage
radar.html           The Radar
journal.html          Journal
source.html            Source (private search request form)
styles.css       Design system + layout styles
main.js          Shared rendering logic + content loader
content/
  radar.json     Radar items — edit by hand OR via /admin
  journal.json   Journal articles — edit by hand OR via /admin
  pages.json     Every other piece of copy on the site (headlines,
                 buttons, the Source service descriptions, form labels,
                 dropdown options) — edit by hand OR via /admin
  site.json      Site-wide settings: name, tagline, contact details,
                 nav labels, footer labels, homepage-featured Radar items
admin/
  index.html     The CMS admin panel itself
  config.yml     Defines the forms shown in the admin panel
assets/uploads/  Where images uploaded via the admin panel land
netlify.toml     Tells Netlify there's no build step
```

---

## Part 1 — Get it online (5 minutes, free)

You need a free GitHub account and a free Netlify account.

1. **Create a GitHub repo.** Go to github.com → New repository → name it
   something like `the-blvd-site` → create it (don't add a README, you
   already have one).
2. **Upload this folder to it.** Easiest way with no command line: on the new
   repo's page, click **"uploading an existing file"** and drag in everything
   from this folder (keeping the folder structure — `content/`, `admin/`,
   `assets/` etc. as subfolders).
3. **Connect it to Netlify.** On netlify.com → **Add new site → Import an
   existing project** → choose GitHub → pick your new repo. Build command:
   leave blank. Publish directory: `.` (a single dot). Click Deploy.

Your site is now live at something like `random-name-123.netlify.app`. You
can rename that subdomain for free in Site settings → Domain management, or
attach your own domain there later for a small yearly fee from a registrar.

---

## Part 2 — Turn on the admin panel (10 minutes, one-time, free)

This gives you a private dashboard at `yoursite.netlify.app/admin` where you
log in and edit Radar items, Journal articles, and site settings through
plain forms — no code, no files.

1. In your Netlify site dashboard: **Site configuration → Identity → Enable
   Identity.**
2. Still in Identity settings: set **Registration → Invite only** (so random
   people can't sign themselves up).
3. **Identity → Services → Git Gateway → Enable Git Gateway.** This is what
   lets the admin panel save your edits back to the site.
4. Go to the **Identity** tab → **Invite users** → enter your own email.
   You'll get an email — click the link, set a password.
5. Visit `yoursite.netlify.app/admin`, log in with that email/password.

That's it. From now on: log in, click a Radar item or Journal article (or
**+ New**), fill in the fields, drag in an image if you have one, hit
**Publish**. The live site rebuilds automatically within about a minute.

If you skip Part 2 entirely, the site still works fine — you'd just edit the
files in `content/` directly (see below) instead of using a dashboard.

---

## What's not in the CMS

The **BLVD.** wordmark itself (the logo treatment in the nav/footer) is
hardcoded in each page rather than pulled from content — it's a brand
mark, not editorial copy, so it stays fixed in the design rather than
something that gets typed into a form. Everything else — every headline,
button label, description, dropdown option and page intro — is editable
via `content/*.json` or the `/admin` dashboard.

## Editing content without the admin panel

Each `content/*.json` file is a plain list of entries. Open one in any text
editor, copy an existing entry, change the values between the quotes, save.
Nothing else needs to change — the pages read these files automatically.

**Note on images:** none of the current Radar entries reference real images
of the named artworks (KAWS, Hirst, etc.) — those are copyrighted works and
shouldn't be reproduced without a license. Leave `"image": ""` and the site
shows a generated placeholder panel instead, so nothing ever breaks while
you're populating real, licensed photography.

## Running it locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. (The admin panel won't work locally —
it needs to talk to Netlify Identity/Git Gateway — but the rest of the site
will.)

## Next steps when you outgrow this

Everything here — design, layout, content shape — was deliberately kept
separate, so each piece can be upgraded independently later: swap Decap CMS
for Sanity/Contentful without touching the design, move to a framework
(Next.js, Astro) for incremental builds once content volume demands it, or
add real payment/invoicing integration to the Source flow once that's
defined. None of that requires rebuilding what's already here.
