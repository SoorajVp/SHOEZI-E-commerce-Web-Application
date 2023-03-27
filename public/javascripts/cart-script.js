
function changeQuantity(cartId, proId, userId, count){
    console.log("-----------------------")
    console.log(userId);
    let quantity = parseInt(document.getElementById(proId).innerHTML);
    count = parseInt(count);
    
    $.ajax({
        url:'/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method:'post',
        success:(response) =>{
            console.log("()()()()()()()()()()()()()()()()()()()()")
            console.log("changeQuantity functions -------------------",response)
            if(response.removeProduct){
                alert("Product remove from Cart");
                location.reload()
            }else{
                console.log("*",response)
                document.getElementById(proId).innerHTML = quantity + count;
                document.getElementById('total').innerHTML = response.total;
            }
        }
    })
}


function removeCartproduct(cartId, proId){
    $.ajax({
        url:'/remove-cartproducts',
        data: {
            cart: cartId,
            product: proId,
            
        },
        method:'post',
        success:(response) =>{
            console.log("changeQuantity functions -------------------",response)
            if(response.removeProduct){
                alert("Product remove from Cart");
                location.reload()
            }
        }
    })
}


function addToCart(prodId) {
try{
    $.ajax({
        url:'/add-to-cart/'+prodId,
        method:'get',
        success:(response)=>{
          if(response.status){
              let count =$('#cart-count').html()
              count = parseInt(count)+1
              $("#cart-count").html(count)
          }
        }
      })
}catch(err){
    console.log(err)
}
}