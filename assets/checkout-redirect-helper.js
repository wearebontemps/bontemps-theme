var checkoutRedirect = function () {
  console.log('inside process no error')
  function get_cookie(name){ return( document.cookie.match('(^|; )'+name+'=([^;]*)')||0 )[2] }
  do {token=get_cookie('cart');}
  while(token == undefined);
  var myshopify_domain='{{ shop.permanent_domain }}'
  try { var ga_linker = ga.getAll()[0].get('linkerParam') }
  catch(err) { var ga_linker ='' }
  var customer_param = '{% if customer %}customer_id={{customer.id}}&customer_email={{customer.email}}{% endif %}'
  checkout_url= "https://checkout.rechargeapps.com/r/checkout?myshopify_domain="+myshopify_domain+"&cart_token="+token+"&"+ga_linker+"&"+customer_param;
  window.location.replace(checkout_url)
}