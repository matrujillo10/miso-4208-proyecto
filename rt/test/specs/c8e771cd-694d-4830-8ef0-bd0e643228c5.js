function loadScript(callback) {
  var s = document.createElement('script');
  s.src = 'https://rawgithub.com/marmelab/gremlins.js/master/gremlins.min.js';
  if (s.addEventListener) {
    s.addEventListener('load', callback, false);
  } else if (s.readyState) {
    s.onreadystatechange = callback;
  }
  document.body.appendChild(s);
}

function unleashGremlins(ttl, callback) {
  function stop() {
    horde.stop();
    callback();
  }
  var horde = window.gremlins.createHorde()
    .gremlin(gremlins.species.formFiller()
                              .canFillElement(function(element) {
                                // Limita los rellenados a aquellos elementos que se pueden rellenar (Escribir en ellos)
                                console.log('canFillElement >>>>>>>>>>>> ' + element);
                                return element.type == 'textarea' || element.type == "text"  || element.type == "" ||
                                        element.type == "password" || element.type == "number" || element.type == "email";
                              }))
    .gremlin(gremlins.species.clicker()
                              .clickTypes(['click']) // solo permite clicks
                              .canClick(function(element) {
                                  console.log('canClick >>>>>>>>>>>> ' + element);
                                  return element.tagName == 'A' || element.tagName == 'BUTTON';
                              }))
    .gremlin(gremlins.species.toucher())
    .gremlin(gremlins.species.scroller())
    .gremlin(function() {
      window.$ = function() {};
    });

  // Si el elemento ya no estÃ¡ en el documento, habrÃ¡ un error. Por tanto, se detienen los gremlins con 5 errores
  horde.mogwai(gremlins.mogwais.gizmo().maxErrors(5)); 

  horde.seed(81432);
  horde.strategy(gremlins.strategies.distribution().distribution([0.2, 0.4, 0.2, 0.2]))
  horde.after(callback);
  window.onbeforeunload = stop;
  setTimeout(stop, ttl);
  horde.unleash();
}

describe('Monkey testing with gremlins ', function() {

  it('it should not raise any error', function() {
    browser.url('/');
    if($('button=Cerrar').isDisplayed()) {
      $('button=Cerrar').click();
    }
    browser.setAsyncTimeout(60000);
    browser.executeAsync(loadScript);
    browser.setAsyncTimeout(60000);
    browser.executeAsync(unleashGremlins, 50000);
  });

  afterAll(function() {
    browser.log('browser').value.forEach(function(log) {
      browser.logger.info(log.message.split(' ')[2]);
    });
  });

});


// Helen Smith 0-7943-1580-1 #2d329f 988-887-4203 222.246.233.33
// 268 2257548308800030 04/21