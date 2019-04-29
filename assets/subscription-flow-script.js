$(document).on('cart.requestStarted', function (event, cart) {
  console.log('started')
})
$(document).on('cart.ready', function (event, cart) {
  console.log('Cart Ready')
})

var subscriptionInterval = null
var idArray = []
var fullSizeArray = []
function checkFull () {
  if (idArray.length === 3) {
    $('#bundle-adder-btn').fadeIn(200)
  } else {
    $('#bundle-adder-btn').fadeOut(200)
  }
}
function addProduct (id, fullSize, tag) {
  idArrayUpdate(id, fullSize)
  addChecks(id)
  checkFull()
  console.log('array from ADD', idArray)
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
function idArrayUpdate (id, fullSizeID) {
  idArray = !idArray.includes(id) && idArray.length < 3
    ? [...idArray, id]
    : idArray.filter(el => el !== id)
  fullSizeArray = !fullSizeArray.includes(id) && fullSizeArray.length < 3
    ? [...fullSizeArray, fullSizeID]
    : fullSizeArray.filter(el => el !== fullSizeID)  
}
function addChecks (id) {
  if (idArray.includes(id)) {
    console.log('addCheck', id)
    $('#checkbox_' + id).addClass('selected')
  } else {
    console.log('removeCheck', id)
    $('#checkbox_' + id).removeClass('selected')
  }
}
function bundleOverview () {
  console.log('ids:', idArray, 'full-size:', fullSizeArray)
  if (idArray.length == 3) {
    console.log('inside if', subscriptionInterval)
    var shippingIntervalFrequency = subscriptionInterval.toString()
    var shippingIntervalUnitType = 'Month'
    var subscriptionID = '203086'
    async.each(idArray, function (id, next) {
      CartJS.addItem(id, 1, {
        'shipping_interval_frequency': shippingIntervalFrequency,
        'shipping_interval_unit_type': shippingIntervalUnitType,
        'subscription_id': subscriptionID
      }, {
        'complete': function () {
          console.log('2 complete!')
        },
        'success': function (data, textStatus, jqXHR) {
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
        console.log('No Errors (1 of 2)')
        subscriptionCart(1)
      }
    })
    //  run full size
    async.each(fullSizeArray, function (id, next) {
      CartJS.addItem(id, 1, {
        'shipping_interval_frequency': 'PH'
      }, {
        'complete': function () {
          console.log('2 complete!')
          window.location('/checkout')
        },
        'success': function (data, textStatus, jqXHR) {
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
        console.log('No Errors (2 of 2)')
        subscriptionCart(2)
      }
    })
  } else {
    alert('Please add more items to your bundle (samples)')
  }
}
function selectInterval (interval) {
  $('.flow-card').removeClass('active')
  $('#interval_next').fadeIn(300)
  $('.interval_target').text(toString(interval))
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
var buildOverview = function (cart, loc) {
  var useArray = []
  if (loc == 1) {
    var domSelector = $('#sub-flow-cart-upper')
    useArray = idArray
  } else if (loc == 2 ) {
    var domSelector = $('#sub-flow-cart-lower')
    useArray = fullSizeArray;
  }
  domSelector.html('')
  console.log('cart:', cart)
  console.log('build_samples ids:', useArray)
  for (j=0; j<useArray.length; j++) {
    for (i=0; i<cart.items.length; i++) {
      if (cart.items[i].id == useArray[j]) {
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
}
var clearCart = function () {
  for (i = 0; i < idArray.length; i++) {
    CartJS.removeItemById(idArray[i])
  }
  for (i = 0; i < fullSizeArray.length; i++) {
    CartJS.removeItemById(fullSizeArray[i])
  }
}
var subscriptionCart = function (loc) {
  jQuery.getJSON('/cart.js', function (cart) {
    var sbt = cart.total_price.toString()
    var subtotalFormatted = '$' + sbt.substring(0, sbt.length - 2) + '.' + sbt.substring(sbt.length - 2)
    buildOverview(cart, loc)
  })
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
