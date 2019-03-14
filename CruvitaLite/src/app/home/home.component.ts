import { Component, OnInit } from '@angular/core';
import { SchoolsService } from 'src/services/schools.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient,
    private schoolsService: SchoolsService) { }

  ngOnInit() {
    this.http.get('//freegeoip.net/json/').subscribe(function(data: any){
        console.log('asdf', data);
        // For if we have too many hits per day, switch to this
        //$http.get('//api.ipify.org?format=jsonp&callback=?', function(data) {
        //   console.log(JSON.stringify(data, null, 2));
        // });
        // var location = 'http://ipinfodb.com/ip_query.php?timezone=false&ip=' + ip;
        // $http.get(location).then(function(data){
        //   console.log(data)
        // })


        var schoolQ = [];

        schoolQ.push({
          "key": "coordinates.latitude",
          "type": "range",
          "min": data.data.latitude,
          "max": data.data.latitude + .2
        },{
          "key":"coordinates.longitude",
          "type": "range",
          "min": data.data.longitude,
          "max": data.data.longitude + .2
        })

        const schoolPromise = this.schoolsService.retrieve({page: 1}, {queries: schoolQ}, function(response) {
          this.nearby.schools = response.schools.results;
          console.log(this.nearby.schools);
        })
	    });
  }

}
