$(document).on('cart.requestStarted', function (event, cart) {
  console.log('started')
})
$(document).on('cart.ready', function (event, cart) {
  console.log('Cart Ready')
})
var product_text_1 = $('#selected_product_1')
var product_text_2 = $('#selected_product_2')
var product_text_3 = $('#selected_product_3')
var product_id_1 = null
var product_id_2 = null
var product_id_3 = null
var product_full_1 = null
var product_full_2 = null
var product_full_3 = null
var subscriptionInterval = null
function checkFull () {
  if (product_id_1 != null && product_id_2 != null && product_id_3 != null) {
    $('#bundle-adder-btn').fadeIn(200)
  } else {
    $('#bundle-adder-btn').fadeOut(200)
  }
}
function addProduct (id, title, tag) {
  var title = title;
  if ($('#selected_product_1').text() == '' ) {
    $('#selected_product_1').text(title);
    product_id_1 = id;
    product_full_1 = tag;
    checkFull();
  } else if ($('#selected_product_2').text() == '') {
    $('#selected_product_2').text(title)
    product_id_2 = id
    product_full_2 = tag
    checkFull()
  } else {
    $('#selected_product_3').text(title)
    product_id_3 = id
    product_full_3 = tag
    checkFull()
  }
  $('html, body').animate({scrollTop: $('#bundle_anchor').offset().top -380}, 800)
};
function removeProduct (loc) {
  if (loc == '1') {
    $('#selected_product_1').text('')
    product_id_1 = null
    checkFull()
  } else if (loc == '2') {
    $('#selected_product_2').text('')
    product_id_2 = null
    checkFull()
  } else if (loc == '3') {
    $('#selected_product_3').text('')
    product_id_3 = null
    checkFull()
  }
};
function bundleOverview() {
  id_array = []
  full_size_array = []
  if (product_id_1 != undefined && product_id_1 != null) {
    id_array.push(product_id_1)
  }
  if (product_id_2 != undefined && product_id_2 != null) {
    id_array.push(product_id_2)
  }
  if (product_id_3 != undefined && product_id_3 != null) {
    id_array.push(product_id_3)
  }
  if (product_full_1 != undefined && product_full_1 != null) {
    full_size_array.push(product_full_1)
  }
  if (product_full_2 != undefined && product_full_2 != null) {
    full_size_array.push(product_full_2)
  }
  if (product_full_3 != undefined && product_full_3 != null) {
    full_size_array.push(product_full_3)
  }
  console.log('ids:', id_array, 'full-size:', full_size_array);
if(id_array.length == 3 ) {
    console.log('inside if', subscriptionInterval)
    var shipping_interval_frequency = subscriptionInterval.toString()
    var shipping_interval_unit_type = 'Month'
    var subscription_id = '203086'
    async.each(id_array, function(id, next) {
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
        console.log('No Errors (1 of 2)');
        subscriptionCart(1);
      }
    });
    //  run full size
    async.each(full_size_array, function (id, next) {
      CartJS.addItem(id, 1, {
        'shipping_interval_frequency': shipping_interval_frequency,
        'shipping_interval_unit_type': shipping_interval_unit_type,
        'subscription_id': subscription_id
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
        console.log('No Errors (2 of 2)');
        subscriptionCart(2);
      }
    })
  } else {
    alert('Please add more items to your bundle (samples)')
};
}
function selectInterval (interval) {
  if (interval == 1) {
    subscriptionInterval = 1
    console.log(subscriptionInterval)
  } else if (interval == 2) {
    subscriptionInterval = 2
    console.log(subscriptionInterval)
  } else if (interval == 3) {
    subscriptionInterval = 3
    console.log(subscriptionInterval)
  }
}
function nextView(pos) {
  if (pos < 3 && pos > 0) {
    index = pos + 1;
    $('.takeover_' + pos).fadeOut(0)
    $('.takeover_' + index).fadeIn(300)
    $('html, body').animate({ scrollTop: 0 }, 'slow')
    if (pos == 2 ) {
      bundleOverview()
    }
  } else {
      return
  }
}
function prevView (pos) {
  if (pos < 4 && pos > 0) {
    index = pos - 1;
    $('.takeover_' + pos).fadeOut(0);
    $('.takeover_' + index).fadeIn(300);
    $('html, body').animate({ scrollTop: 0 }, 'slow')
  }
}
var buildOverview = function (cart, loc) {
  var useArray = []
  var loc = loc
  if (loc == 1) {
    var domSelector = $('#sub-flow-cart-upper')
    var useArray = id_array
  } else if (loc == 2 ) {
    var domSelector = $('#sub-flow-cart-lower')
    var useArray = full_size_array;
    $('.interval_target').text(subscriptionInterval.toString())
  }
  domSelector.html('')
  console.log('cart:', cart)
  console.log('build_samples ids:', useArray)
  for (j = 0; j < useArray.length; j++) {
    for (i = 0; i < cart.items.length ; i++) {
      if (cart.items[i].id == useArray[j]) {
        item = cart.items[i]
        var str = item.price.toString()
        var priceFormatted = '$'+str.substring(0,str.length-2)+"."+str.substring(str.length-2)
        domSelector.append(
          '<div class="row" style="margin: .25em auto;">'+
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
var subscriptionCart = function (loc) {
  jQuery.getJSON('/cart.js', function (cart) {
    var sbt = cart.total_price.toString()
    var subtotalFormatted = '$'+sbt.substring(0,sbt.length-2)+"."+sbt.substring(sbt.length-2)
    buildOverview(cart, loc)
  })
}
$('#subscription_start').click(function (e) {
  e.preventDefault()
  $('.takeover_1').fadeIn(300)
})
$('.takeover_closer').click(function (e) {
  e.preventDefault()
  $('.takeover').fadeOut(300)
})
