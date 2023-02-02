const fs = require('fs');
const Readable = require('stream').Readable;
const { TestRun, Status } = require('@saucelabs/sauce-json-reporter');
const { TestComposer } = require('@saucelabs/testcomposer');

const client = new TestComposer({
  region: 'eu-central-1',
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  headers: { 'User-Agent': `your-fancy-reporter/1.2.3` },
});

let r = new TestRun();
const s1 = r.withSuite('somegroup');
const s2 = s1.withSuite('somefile.test.js');
s2.withTest('yay', {
  status: Status.Passed,
  duration: 123,
});
s2.withTest('nay', {
  status: Status.Passed,
  duration: 123,
});

(async () => {
  const job = await client.createReport({
    name: 'My Fancy Job!',
    passed: true,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    browserName: 'Chrome',
    browserVersion: '105',
    framework: 'komornik',
    frameworkVersion: '4.8',
    platformName: 'Windows 11',
  });

  const imageData = fs.createReadStream('./screenshot-1.png');

  const consoleLogData = new Readable();
  consoleLogData.push('hello!');
  consoleLogData.push(null);

  const sauceReport = new Readable();
  sauceReport.push(r.stringify());
  sauceReport.push(null);

  const uploads = await client.uploadAssets(job.id, [
    { filename: 'screenshot-1.png', data: imageData },
    { filename: 'console.log', data: consoleLogData },
    { filename: 'sauce-test-report.json', data: sauceReport },
  ]);

  console.log(job.id);
  console.log(job.url);
  console.log(uploads);
})();
