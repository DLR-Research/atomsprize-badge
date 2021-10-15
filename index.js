const AWS = require('aws-sdk')
let chromium, params, puppeteer, rdsDataService, browserWSEndpoint, browser, page
try {
  chromium = require('chrome-aws-lambda')
  puppeteer = chromium.puppeteer
  params = async () => ({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  })
  rdsDataService = new AWS.RDSDataService()
} catch (e) {
  puppeteer = require('puppeteer-core')
  params = async () => ({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--single-process'],
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  })
  rdsDataService = new AWS.RDSDataService({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })
}
const sharp = require('sharp')

const TX_PARAMS = {
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.RDS_ARN,
  database: 'campaigns'
}

const sql = query => ({
  ...TX_PARAMS,
  sql: query
})

const runSql = theSql => {
  return new Promise((resolve, reject) => {
    rdsDataService.executeStatement(sql(theSql), (err, data) => {
      if (err) {
        console.log('error with the following query:')
        console.log(sql(theSql))
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const new_browser = async () => {
  browser = await puppeteer.launch(await params())
  browserWSEndpoint = browser.wsEndpoint()
}

const open_page = async () => {
  if (!page || page.isClosed()) {
    page = await browser.newPage()
    await page.goto('about:blank')
    await page.addScriptTag({ path: require.resolve('./render.js') })
  }
}

const cleanup_browser = async () => {
  try {
    await browser.close()
    await browser.disconnect()
  } catch (e) {}
}

const get_png = async event => {
  const browserConnected = browser?.isConnected()
  if (!browserConnected) {
    await cleanup_browser()
    if (browserWSEndpoint) {
      try {
        browser = await puppeteer.connect({ browserWSEndpoint })
      } catch (e) {
        await new_browser()
      }
    } else {
      await new_browser()
    }
  }
  try {
    await open_page()
  } catch (e) {
    await cleanup_browser()
    await new_browser()
    await open_page()
  }
  const donor = {
    user_id: Number(event.user_id),
    total_donated: Number(event.total_donated)
  }

  const png = await page.evaluate(donor => {
    return render_the_badge(donor)
  }, donor)
  const buf = Buffer.from(png.split(';base64,').pop(), 'base64')
  const resized = await sharp(buf).png({ compressionLevel: 9, quality: 50 }).toBuffer()
  return await resized.toString('base64')
}

exports.handler = async event => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png'
    },
    body: JSON.stringify(await get_png(event)),
    isBase64Encoded: true
  }
}
