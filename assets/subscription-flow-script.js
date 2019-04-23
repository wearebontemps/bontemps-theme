$(document).on('cart.requestStarted', function (event, cart) {
  console.log('started')
})
$(document).on('cart.ready', function (event, cart) {
  console.log('Cart Ready')
})
// var product_text_1 = $('#selected_product_1')
// var product_text_2 = $('#selected_product_2')
// var product_text_3 = $('#selected_product_3')
var productID1 = null
var productID2 = null
var productID3 = null
var productFull1 = null
var productFull2 = null
var productFull3 = null
var subscriptionInterval = null
var idArray = []
var fullSizeArray = []
function checkFull () {
  if (productID1 != null && productID2 != null && productID3 != null) {
    $('#bundle-adder-btn').fadeIn(200)
  } else {
    $('#bundle-adder-btn').fadeOut(200)
  }
}
function addProduct (id, title, tag) {
  if (idArray.length === 0) {
    $('#selected_product_1').text(title)
    productID1 = id
    productFull1 = tag
    addChecks(id, tag)
    checkFull()
  } else if (idArray.length === 1) {
    $('#selected_product_2').text(title)
    productID2 = id
    productFull2 = tag
    // pushIDs(productID2, productFull2)
    addChecks(id, tag)
    checkFull()
  } else if (idArray.length === 2) {
    $('#selected_product_3').text(title)
    productID3 = id
    productFull3 = tag
    // pushIDs(productID3, productFull3)
    addChecks(id, tag)
    checkFull()
  } else {
    $('#selected_product_3').text(title)
    idArray.pop()
    fullSizeArray.pop()
    productID3 = id
    productFull3 = tag
    // pushIDs(productID3, productFull3)
    addChecks(id, tag)
    checkFull()
  }
  console.log('array from ADD', idArray)
};
function removeProduct (loc) {
  if (loc == '1') {
    $('#selected_product_1').text('')
    productID1 = null
    checkFull()
  } else if (loc == '2') {
    $('#selected_product_2').text('')
    productID2 = null
    checkFull()
  } else if (loc == '3') {
    $('#selected_product_3').text('')
    productID3 = null
    checkFull()
  }
};
function pushIDs (id, idFull) {
  if (idArray.length < 3) {
    idArray.push(id)
  }
  if (fullSizeArray.length < 3) {
    fullSizeArray.push(idFull)
  }
}

function addChecks (id, tag) {
  pushIDs(id, tag)
  console.log('addCheck', id)
  $.each(idArray, function (index, value) {
    console.log('inside-each', value)
    if (id === value) {
      $('#checkbox_' + id).removeClass('selected')
      // idArray.splice(idArray.indexOf(value), 1)
      console.log('splice pos:', index, 'result', idArray)
    } else {
      $('#checkbox_' + id).addClass('selected')
    }
  })
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
        'Part of a Bundle': '',
        'test': ''
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
        'shipping_interval_frequency': shippingIntervalFrequency,
        'shipping_interval_unit_type': shippingIntervalUnitType,
        'subscription_id': subscriptionID
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
    $('.interval_target').text(subscriptionInterval.toString())
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
          '<div class="col-4 d-flex align-items-center" data-label="{{ "customer.order.product" | t }}">' +
          '<img src="' + item.image + '" alt="' + item.title + '"/>' +
          '</div>' +
          '<div class="col-8 d-flex align-items-center" style="background-color: #f5f5f5; padding: 1em">' +
          '<div class="row" style="width:100%;">' +
          '<div class="col-6 d-flex flex-column align-items-start justify-content-between">' +
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
var checkoutRedirect = function () {
  for (i = 0; i < fullSizeArray.length; i++) {
    CartJS.removeItemById(fullSizeArray[i])
  }
  window.location.replace('/checkout')
}
$('#subscription_start').click(function (e) {
  e.preventDefault()
  $('.takeover_1').fadeIn(300)
})
$('.takeover_closer').click(function (e) {
  e.preventDefault()
  $('.takeover').fadeOut(300)
  clearCart()
})
