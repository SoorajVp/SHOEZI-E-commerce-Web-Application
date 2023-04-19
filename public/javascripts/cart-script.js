// const { default: axios } = require("axios");

function changeQuantity(cartId, proId, userId, count){
    let quantity = parseInt(document.getElementById(proId).innerHTML);
    count = parseInt(count);
    console.log("this cart quantity ----------", quantity)
    
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
            console.log("*",response)

            if(response.removeProduct){
                //alert("Product remove from Cart");
                setTimeout(() => {
                    location.reload()
                }, 1900);
                Toast.fire({
                    icon: 'error',
                    title: 'Item removed from Cart !'
                  })
            }else if(response.status){
                
              
              document.getElementById(proId).innerHTML = quantity + count;
              let totalPrice = response.total
              document.getElementById('total').innerHTML = totalPrice.toLocaleString('en-in', { style: 'currency', currency: 'INR' });

              let price = parseInt(document.getElementById(`${proId}price`).innerHTML);
              // price = parseInt(price.replace(/[^0-9.-]+/g,""));
              let qnty = parseInt(document.getElementById(proId).innerHTML);
              subTotal = price*qnty;
              document.getElementById(`${proId}subtotal`).innerHTML = subTotal

            }else{
              swal({
                title: " <small>Reached Maximum Limit</small>!",
                html: true
              });
            }
        }
    })
}


function removeCartproduct(cartId, proId){
  swal({
    title: "Are you sure?",
    text: "You will not be able to recover this cart item !",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, delete it !",
    closeOnConfirm: false
  },
  function(){
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
              setTimeout(() => {
                  location.reload()
              }, 2000);
              swal("Deleted!", "Your cart item has been deleted.", "success");
          }
      }
  })
    
  });
    
}





function addToCart(prodId) {
try{
    $.ajax({
        url:'/add-to-cart/'+prodId,
        method:'get',
        success:(response)=>{
          console.log(response)
          if(response.status){

              let count =$('#cart-count').html()
              count = parseInt(count)+1
              $("#cart-count").html(count)

              Toast.fire({
                icon: 'success',
                title: 'Item added to cart !'
              })

          }else{
            Toast.fire({
              icon: 'error',
              title: 'Reached Maximum Limit !'
            })
          }
        }
      })
}catch(err){
    console.log(err)
}
}




function WishList(proId, userid){
    console.log(proId , userid);
    axios.post('/wishList', {
        proId: proId,
        userId: userid
      })
      .then(function (response) {
        console.log(response);
        if(response.data.status == true){
               Toast.fire({
                icon: 'success',
                title: 'Added to Wishlist !'
              })
        }else{
            Toast.fire({
                icon: 'error',
                title: 'wishlist Item removed !'
              })
            
        }
      })
      .catch(function (error) {
        console.log(error);
      });
}

function WishListRemove(proId, userid){
    console.log(proId , userid);
    axios.post('/remove-wishlist', {
        proId: proId,
        userId: userid
      })
      .then(function (response) {
        console.log(response)
        setTimeout(()=>{
          location.reload()
        },1700)
        Toast.fire({
            icon: 'error',
            title: 'Item will be removed !'
          })
      })
      .catch(function (error) {
        console.log(error);
      });
}



const Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 1500,
    // timerProgressBar: true
})

  
async function  subCategory(mainItem, subItem) {
  console.log(mainItem , subItem);
  
  const res =await axios({
    method:'post',
    url:`/shop/${mainItem}`,
    data:{
      main: mainItem,
      sub: subItem
    }
  })
  if(res){
    location.assign(`/shop/${mainItem}`)
  }
  
}

function inventery(){
  Toast.fire({
    icon: 'error',
    title: 'Cart item is Out of stock !'
  })
}



