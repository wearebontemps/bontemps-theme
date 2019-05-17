$(document).on('cart.requestStarted', function (event, cart) {
  console.log('started')
})
$(document).on('cart.ready', function (event, cart) {
  console.log('Cart Ready')
})

var subscriptionInterval = null
var idArray = []
var fullSizeArray = []
var handleArray = []
function checkFull () {
  if (idArray.length === 3) {
    $('#bundle-adder-btn').attr('disabled', false)
  } else {
    $('#bundle-adder-btn').attr('disabled', true)
  }
}
function addProduct (id, fullSize, handle) {
  idArrayUpdate(id, fullSize, handle)
  addChecks(id)
  checkFull()
  console.log('idArray', idArray, 'fullsize array', fullSizeArray, 'handleArray', handleArray)
};
function pushIDs (id, idFull) {
  if (idArray.length < 3) {
    idArray.push(id)
    console.log('idArray:', idArray)
  }
  if (fullSizeArray.length < 3) {
    fullSizeArray.push(idFull)
  }
}
function idArrayUpdate (id, fullSizeID, handle) {
  idArray = !idArray.includes(id) && idArray.length < 3
    ? [...idArray, id]
    : idArray.filter(el => el !== id)
  fullSizeArray = !fullSizeArray.includes(id) && fullSizeArray.length < 3
    ? [...fullSizeArray, fullSizeID]
    : fullSizeArray.filter(el => el !== fullSizeID)
  handleArray = !handleArray.includes(handle) && handleArray.length < 3
    ? [...handleArray, handle]
    : handleArray.filter(el => el !== handle)
}
function addChecks (id) {
  if (idArray.includes(id)) {
    console.log('addCheck', id)
    $('.hover_' + id).addClass('selected')
  } else {
    console.log('removeCheck', id)
    $('.hover_' + id).removeClass('selected')
  }
}
function bundleOverview () {
  console.log('ids:', idArray, 'full-size:', fullSizeArray)
  if (idArray.length === 3) {
    var shippingIntervalFrequency = subscriptionInterval.toString()
    console.log('shippingIntervalFrequency', shippingIntervalFrequency)
    var shippingIntervalUnitType = 'Month'
    var subscriptionID = '206077'
    async.each(idArray, function (id, next) {
      CartJS.updateItem(id, 1, {
        'shipping_interval_frequency': shippingIntervalFrequency,
        'shipping_interval_unit_type': shippingIntervalUnitType,
        'subscription_id': subscriptionID,
        'sample_attr': true
      }, {
        'complete': function () {
          console.log('2 complete!')
        },
        'success': function (data, textStatus, jqXHR) {
          console.log('success', id)
          next()
        },
        'error': function (jqhXHR, textStatus, errorThrown) {
          next(errorThrown)
        },
        async: true
      })
    },
    function (error) {
      if (!error) {
        subscriptionCart(1)
      }
    })
    //  run full size
  } else {
    alert('Please add more items to your bundle (samples)')
  }
}

var subscriptionCart = function (loc) {
  jQuery.getJSON('/cart.js', function (cart) {
    if (cart.items.length < 3) {
      console.log('failed. run again')
      clearCart()
      bundleOverview()
    } else {
      buildOverview(cart, loc)
    }
  })
}

var buildOverview = function (cart, loc) {
  var useArray = idArray
  var domSelector = $('#sub-flow-cart-upper')
  domSelector.html('')
  console.log('cart:', cart)
  console.log('useArray:', loc, useArray)
  var j
  var i
  for (j = 0; j < useArray.length; j++) {
    for (i = 0; i < cart.items.length; i++) {
      if (cart.items[i].id == useArray[j] && cart.items[i].properties.sample_attr) {
        var item = cart.items[i]
        var str = item.price.toString()
        var priceFormatted = '$' + str.substring(0, str.length - 2) + '.' + str.substring(str.length - 2)
        domSelector.append(
          '<div class="row" style="margin: .25em auto;">' +
          '<div class="col-5 d-flex align-items-center" style="padding:0;">' +
          '<img src="' + item.image + '" alt="' + item.title + '"/>' +
          '</div>' +
          '<div class="col-7 d-flex align-items-center" style="padding: .5em">' +
          '<div class="row" style="width:100%;">' +
          '<div class="col-12 d-flex flex-column align-items-start justify-content-between">' +
          '<p>' + item.title + '</span></p>' +
          '<div>' + priceFormatted + '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>'
        )
      }
    }
  }
  buildLower()
}
var buildLower = function () {
  var domSelector = $('#sub-flow-cart-lower')
  domSelector.html('')
  for (j = 0; j < handleArray.length; j++) {
    fetch('https://shopbontemps.com/collections/all/products/' + handleArray[j] + '.json')
      .then(res => res.json())
      .then((out) => {
        console.log('Checkout this JSON! ', out)
        var fullItem = out.product
        console.log('parsed item', fullItem)
        var str = fullItem.variants[0].price.toString()
        var priceFormatted = '$' + str.substring(0, str.length - 2) + str.substring(str.length - 2)
        domSelector.append(
          '<div class="row" style="margin: .25em auto;">' +
          '<div class="col-5 d-flex align-items-center" style="padding:0;">' +
          '<img src="' + fullItem.image.src + '" alt="' + fullItem.title + '"/>' +
          '</div>' +
          '<div class="col-7 d-flex align-items-center" style="padding: .5em">' +
          '<div class="row" style="width:100%;">' +
          '<div class="col-12 d-flex flex-column align-items-start justify-content-between">' +
          '<p>' + fullItem.title + '</span></p>' +
          '<div>' + priceFormatted + '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>'
        )
      })
      .catch(err => { throw err });
  }
}

function selectInterval (interval) {
  $('.flow-card').removeClass('active')
  $('#interval_next').attr('disabled', false)
  $('.interval_target').text(interval)
  if (interval == 1) {
    subscriptionInterval = 1
    $('.interval_selector_1').addClass('active')
  } else if (interval == 2) {
    subscriptionInterval = 2
    $('.interval_selector_2').addClass('active')
  } else if (interval == 3) {
    subscriptionInterval = 3
    $('.interval_selector_3').addClass('active')
  }
}
function nextView(pos) {
  if (pos < 3 && pos > 0) {
    var index = pos + 1;
    $('.takeover_' + pos).fadeOut(0)
    $('.takeover_' + index).fadeIn(300)
    $('html, body').animate({ scrollTop: 0 }, 'slow')
    if (pos == 2 ) {
      bundleOverview()
    }
  }
}
function prevView (pos) {
  if (pos < 4 && pos > 0) {
    if (pos == 3) {
      clearCart();
    }
    var index = pos - 1
    $('.takeover_' + pos).fadeOut(0)
    $('.takeover_' + index).fadeIn(300)
    $('html, body').animate({ scrollTop: 0 }, 'slow')
  }
}
var clearCart = function () {
  console.log('empty cart based on IDs')
  for (i = 0; i < idArray.length; i++) {
    CartJS.removeItemById(idArray[i])
  }
  for (i = 0; i < fullSizeArray.length; i++) {
    CartJS.removeItemById(fullSizeArray[i])
  }
}

$('#subscription_start').click(function (e) {
  e.preventDefault()
  $('.takeover_1').fadeIn(300)
})
$('#subscription_start_2').click(function (e) {
  e.preventDefault()
  $('.takeover_1').fadeIn(300)
})
$('.takeover_closer').click(function (e) {
  e.preventDefault()
  $('.takeover').fadeOut(300)
  clearCart()
})
