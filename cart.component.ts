import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../../servises/cart/cart.service';
import { tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  isLoading: boolean = false;
  error: any;
  cartList: any;
  message: any;
  alertMsg: { "class": string; "text": any; "info": string; };
  
  @ViewChild('paymentform',{ static: true }) form: ElementRef;

  encRequest: String;
  accessCode: String;

  constructor(
    private cartservice: CartService,
    private router: Router
  ) {
    this.getcartlist()
  }

  getActualPrice(){
    return this.cartList.map(t => t.actual_price).reduce((a,value) => a + value, 0)
  }

  getDiscountPrice(){
    return this.cartList.map(t => t.discount_price).reduce((a,value) => a + value, 0)
  }

  getFinalPrice(){
    return this.cartList.map(t => t.final_price).reduce((a,value) => a + value, 0)
  }

  getcartlist(){
    this.isLoading = true
    let cartlistParam = {
      user_id: localStorage.getItem('user_Id'),
    }
    this.cartservice.cartListApi(cartlistParam).pipe(
      tap(response => {
        this.cartList = response.status == "success" ? response.data.content : [];
      }),
      finalize(() => this.isLoading = false),
      catchError(error => of(this.error = error))
    ).subscribe();
  }

  movetoWishlist(cart_id){
    this.isLoading = true;
    let cartid = {id:cart_id};
    this.cartservice.movetoWishlistApi(cartid).pipe(
      tap(response => {
        this.message = response.response.message;
        if(response.status == "success"){
          this.getcartlist();
        }
        if(response.status == "success" || response.status == "failure" ){
          this.alertMsg = {
            "class": 'received',
            "text": response.response.message,
            "info": 'Success',
          };
         }
      }),
      finalize(() => this.isLoading = false),
      catchError(error => of(this.error = error))
    ).subscribe();
  }

  removeCart(cart_id){
    this.isLoading = true;
    let cartid = {id:cart_id};
    this.cartservice.removeCartApi(cartid).pipe(
      tap(response => {
        this.message = response.response.message;
        if(response.status == "success"){
          this.getcartlist();
        }
        if(response.status == "success" || response.status == "failure" ){
          this.alertMsg = {
            "class": 'received',
            "text": response.response.message,
            "info": 'Success',
          };
         }
      }),
      finalize(() => this.isLoading = false),
      catchError(error => of(this.error = error))
    ).subscribe();
    
  }

  contShoping(){
    this.router.navigate(['user/home'])
  }

  checkOut(ActualPrice, DiscountPrice, FinalPrice){
    this.isLoading = true;
    let checkoutData = {
      user_id: localStorage.getItem('user_Id'),
      booking_type: 'cart',
      actual_price: ActualPrice,
      discount_price: DiscountPrice,
      final_price: FinalPrice,
    }
    //this.form.nativeElement.submit()
    this.cartservice.checkOutApi(checkoutData).pipe(
    tap( response =>{
      console.log(response);
      this.form.nativeElement.submit()
    }),
    finalize(() => this.isLoading = false),
    catchError(error => of(this.error = error))
    ).subscribe()
  }

  ngOnInit() {
  }

}
