import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HomeService } from "../../services/home/home.service";
import { tap, finalize, catchError } from "rxjs/operators";
import { of } from "rxjs";
import { SupportService } from "src/app/modules/support/services";
import { Router } from "@angular/router";
import { AuthService } from "../../../../core/services";
import { MustMatch } from "src/app/shared";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  homeForm: FormGroup;
  submitted = false;
  error: any;
  isLoading: boolean = false;
  RecentCourses_data: any[];
  comboOffers: any[];
  freeLession_data: any[];
  upcommingCourse_data: any[];
  dropDownList: any[];
  alertMsg: { class: string; text: any; info: string };
  message: any;
  banners: any;

  /* Clock Vars Start */ 
  startDateTime = new Date(2020, 0, 1, 23, 59, 59, 0);
  startStamp = this.startDateTime.getTime();
  newDate = new Date();
  newStamp = this.newDate.getTime();
  timer: any;
  day: number;
  hour: number;
  min: number;
  sec: number;
/* Clock Vars End */ 

  constructor(
    private formBuilder: FormBuilder,
    private homeService: HomeService,
    private supportService: SupportService,
    private router: Router,
    private authService: AuthService
  ) {
    this.homeForm = this.formBuilder.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phone: [
          null,
          [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]
        ],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required]
      },
      { validator: MustMatch("password", "confirmPassword") }
    );

    this.isLoading = true;

    // Banner Api

    this.homeService
      .bannerApi()
      .pipe(
        tap(response => {
          this.banners = response.data;
        }),
        finalize(() => (this.isLoading = false)),
        catchError(error => of((this.error = error)))
      )
      .subscribe();

    // Recent Courses

    this.homeService
      .recentCoursesApi()
      .pipe(
        tap(response => {
          this.RecentCourses_data = response.data;
          if (this.RecentCourses_data.length < 4) {
            let count = 4;
            let iterate = count - this.RecentCourses_data.length;
            for (let i = 0; i < iterate; i++) {
              this.RecentCourses_data.push({
                title: "Coming Soon",
                course_code: "",
                image: "assets/Images/Global/comingSoon.jpg",
                description: null,
                max_rating: "0.0",
                rating: "0.0",
                actual_price: "0",
                discount_price: 0,
                final_price: 0,
                offer: 0,
                entity_type: "",
                entity_id: 0
              });
            }
          }
        }),
        finalize(() => (this.isLoading = false)),
        catchError(error => of((this.error = error)))
      )
      .subscribe();

    // Combo Offer

    this.homeService
      .comboOfferApi()
      .pipe(
        tap(response => {
          this.comboOffers = response.data;
        }),
        finalize(() => (this.isLoading = false)),
        catchError(error => of((this.error = error)))
      )
      .subscribe();

    // section 4

    this.homeService
      .section_4_Api()
      .pipe(
        tap(response => {
          this.freeLession_data = Array.from(
            Object.keys(response.data),
            k => response.data[k]
          );
          finalize(() => (this.isLoading = false)),
            catchError(error => of((this.error = error)));
        })
      )
      .subscribe();

    // Upcoming Courses

    this.homeService
      .upcomingCoursesApi()
      .pipe(
        tap(response => {
          this.upcommingCourse_data = response.data;
          if (this.upcommingCourse_data.length < 4) {
            let count = 4;
            let iterate = count - this.upcommingCourse_data.length;
            for (let i = 0; i < iterate; i++) {
              this.upcommingCourse_data.push({
                course_title: "Coming Soon",
                image: "assets/Images/Global/comingSoon_350x250.jpg",
                course_description:
                  "Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs.",
                lunching_date: "Upcomming"
              });
            }
          }
          finalize(() => (this.isLoading = false)),
            catchError(error => of((this.error = error)));
        })
      )
      .subscribe();

    // Free Lessoin Dropwown List

    this.supportService
      .preparationDropdownApi()
      .pipe(
        tap(response => {
          this.dropDownList = Array.from(
            Object.keys(response.data),
            k => response.data[k]
          );
        }),
        finalize(() => (this.isLoading = false)),
        catchError(error => of((this.error = error)))
      )
      .subscribe();
  }

  updateClock() {
    this.newDate = new Date();
    this.newStamp = this.newDate.getTime();
    var diff = Math.round((this.newStamp - this.startStamp) / 1000);

    this.day = Math.floor(diff / (24 * 60 * 60));
    diff = diff - this.day * 24 * 60 * 60;
    this.hour = Math.floor(diff / (60 * 60));
    diff = diff - this.hour * 60 * 60;
    this.min = Math.floor(diff / 60);
    diff = diff - this.min * 60;
    this.sec = diff;
  }

  ngOnInit() {
    setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  get f() {
    return this.homeForm.controls;
  }

  // Free leson form
  submitFreeLesonForm() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.homeForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.homeService
      .registerApi(this.homeForm.value)
      .pipe(
        tap(response => {
          if (response.status == "success" || response.status == "failure") {
            this.alertMsg = {
              class: "received",
              text: response.response.message,
              info: "Success"
            };
          }
        }),
        finalize(() => (this.isLoading = false)),
        catchError(error => of((this.error = error)))
      )
      .subscribe();
  }

  // Read More

  readMore() {
    this.authService.isSession()
      ? this.router.navigate(["user/aboutUs"])
      : this.router.navigate(["auth/aboutUs"]);
  }

  // Recent Courses Details page Redirection

  courseDetails(pageName, id) {
    this.authService.isSession()
      ? this.router.navigate([`user/home/${pageName}`, { id: id }])
      : this.router.navigate([`auth/home/${pageName}`, { id: id }]);
  }

  addToCart(entity_type, entity_id) {
    if (this.authService.isSession()) {
      this.isLoading = true;
      let addtocartParam = {
        user_id: localStorage.getItem("user_Id"),
        entity_id: entity_id,
        entity_type: entity_type
      };
      this.homeService
        .addToCartApi(addtocartParam)
        .pipe(
          tap(response => {
            this.message = response.response.message;
            if (response.status == "success" || response.status == "failure") {
              this.alertMsg = {
                class: "received",
                text: response.response.message,
                info: "Success"
              };
            }
          }),
          finalize(() => (this.isLoading = false)),
          catchError(error => of((this.error = error)))
        )
        .subscribe();
    } else {
      this.router.navigate(["auth/login"]);
    }
  }

  callError(error) {
    this.alertMsg = {
      class: "received",
      text: this.message,
      info: "Alert"
      // "colorClass": "message-danger"
    };
  }

  //Recent course
  recentcourse: any = {
    // items: 1,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    // autoWidth: true,
    // autoHeight: true,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>'
    ],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      },
      1024: {
        items: 5
      }
    },
    nav: true
  };

  // Combo Offer
  ComboOfferSlide: any = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>'
    ],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 3
      }
    },
    nav: true
  };

  // Upcoming Courses
  upcomingCourses: any = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>'
    ],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      },
      1024: {
        items: 5
      }
    },
    nav: true
  };
}
