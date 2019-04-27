const express = require('express');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const app = express();

app.get('/', (req,res) => {
    res.write("Server is Running");
    res.end();
});

app.get('/page/:page', async (req,res) => {
    const page = req.params.page;
    
    const a = await getFikh(page);
    res.write(JSON.stringify(a));
    res.end();
    
});

app.get('/link/:link', async (req,res) => {
    const link = req.params.link;
    
    const a = await getItemFikh(link);
    res.write(JSON.stringify(a));
    res.end();
    
});

const getItemFikh = async (link) => {
    const url = `https://konsultasisyariah.com/${link}.html`
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const promises = [];

    $('.td-ss-main-content > article').each((i, item) => {
        const $item = $(item);
        const category = [];
        let title, author, date, image;

        $item.find('.td-post-header > ul[class="td-category"] > .entry-category').each((i,part) => {
            const $part = $(part);
            const cat = $part.find('a').text();
            category.push(cat);
        });

        $item.find('header[class="td-post-title"]').each((i,part) => {
            const $part = $(part);
            title = $part.find('.entry-title').text();
            author = $part.find('.td-post-author-name > a').text();
            date = $part.find('time[class="entry-date updated td-module-date"]').text();
        });

        const description = [];

        $item.find('.td-post-content').each((i,part) => {
            const $part = $(part);
            image = $part.find('.td-post-featured-image > figure > a').attr('href');
        });

        $item.find('.td-post-content > p').each((i,part) => {
            const $part = $(part);
            const isi = $part.text();

            description.push(isi);
        });
        
        image = image.substring(2, image.length);

        article = {
            title,
            author,
            date,
            category : category.join('\n'),
            image,
            description : description.join('\n')
        }

        promises.push(article);

    });

    await Promise.all(promises);
    return promises;

};

const getFikh = async (page) => {
    const url = `https://konsultasisyariah.com/category/fikih/page/${page}`
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const promises = [];

    $('.item-details').each((i, item) => {
        const $item = $(item);
        let title;
        let choose;
        let dateTime;
        let date;

        $item.find('h3[class="entry-title td-module-title"] > a').each((i,part) => {
            const $part = $(part);
            title = $part.attr('title');
            choose = $part.attr('href');
        });

        $item.find('time[class="entry-date updated td-module-date"]').each((i,part) => {
            const $part = $(part);
            dateTime = $part.attr('datetime');
            date = $part.text();
        });

        const chosen = choose.split('/')[3];
        const link = chosen.split('.')[0];

        fikh = {
            title,
            link,
            dateTime,
            date,
            choose
        }

        promises.push(fikh);

    });

    await Promise.all(promises);
    return promises;
};

const port = process.env.PORT || 1300;
app.listen(port, () => console.log(`app Listening on port ${port}`));
