# 🔮✨ Launch Bookface: Farseer AI - Ad-hoc web scraping with GPT

Hey YC! Ever needed to quickly extract info from a web page and dump it into something structured (json, csv, sql)? Say no more fam! We built Farseer to do exactly that.

🔮✨ Farseer is a browser extension that answers questions (both qualitative and quantitative) about a web page, returning the results in a structured format.


[![Farseer AI Demo](https://img.youtube.com/vi/Ib7zZC26KCg/0.jpg)](https://www.youtube.com/watch?v=Ib7zZC26KCg)

#### ❓👉 __Sound interesting? Have a slightly different use case?__
We'd love to hear what your needs are, even if it's not entirely covered here! Just shoot us an email:

📧 [justin.a.hilliard@gmail.com](mailto:justin.a.hilliard@gmail.com)

### 🙇‍♂️ Background
A client needed to scrape 1000's of *different* pages for some structured data, so we built Farseer to see how difficult it would be to automate the process. Turns out with GPT and some clever HTML parsing, we're able to effectively grab data and answer qualitative questions about the page with pretty good accuracy.

Right now it's a prototype, but we're eager to see if there's interest beyond this one client.

### 🫠 Use Cases
- **Lists w/ Context** - we've all done hours research, only end up with a list of URLs without any context. Use Farseer to save the urls and add a blurb about the page.
- **Lead Generation** - Take LinkedIn profiles, ask common questions about the profiles, send that data to CRM or airtable.
- **Recruiting** - Take LinkedIn profiles, ask common questions about the profiles, send that data to an ATS or airtable.
- **Investing/VC** - Save and summarize company marketing in different lists and questions to those pages.
- **Cataloging** - Take webpages with product information and save them to a common destination.

### ⚙️ How it works
1. 📝 **Create** a template. A template is just a collection of `keys` and `hints`. These hints and key names are used to determine what data should be scraped and what that data should look like.
1. 🏃‍♂️ **Run** your template. This will grab relevant HTML from your page and either extract relevant data or send it through GPT for further summarization/extraction.
1. ⛴️ **Export** the data. We're working on integrations like Airtable, Sheets, Download as CSV, etc.

# Our Ask
We're looking for any and all use cases for a tool like this. Have something in mind? Get in touch with us and let's take it from there!

📧 [justin.a.hilliard@gmail.com](mailto:justin.a.hilliard@gmail.com)
