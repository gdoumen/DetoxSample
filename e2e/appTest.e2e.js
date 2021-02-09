const mocked = () => process.env.RN_SRC_EXT=='e2e.js';

describe('App Test', () => {

  beforeAll(async () => {
    await device.launchApp();    
  });

  beforeEach(async () => {
    await device.reloadReactNative();  
  });

  it('should have ScrollView', async () => {
    const el = await element(by.id('scrollView'));
    expect(el).toBeVisible();
  });

  it('should have welcome text', async () => {
    await expect(element(by.text("Welcome to \n'Joke of the day'"))).toBeVisible();
  });

  it('should show a joke', async () => {
    const el = await element(by.id('joke'));
    expect(el).toBeVisible();
  });

  it('should refresh joke on swipe down', async () => {
    // I would like to heck that text has changed, but this would only work on IOS using el.getAtttributes()
    // I use a workaround based on the environment variable that was used to setup mocks.
    if (mocked())    
      await expect(element(by.id('joke'))).toHaveText('some very bad joke');

    await element(by.id('scrollView')).swipe('down');

    const el = await element(by.id('joke'));
    expect(el).toBeVisible();
    if (mocked())
      expect(el).toHaveText('some very bad joke #2');

  });

});
