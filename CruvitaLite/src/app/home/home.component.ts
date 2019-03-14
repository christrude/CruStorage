import { Component, OnInit } from '@angular/core';
import { SchoolsService } from '../../services/schools.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private http: HttpClient,
    public schoolsService: SchoolsService
  ) { }

  ngOnInit(): void {
    this.http.get('http://extreme-ip-lookup.com/json/45.37.164.152').subscribe(function(data: any){
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
          "min": data.lat,
          "max": data.lat + .2
        },{
          "key":"coordinates.longitude",
          "type": "range",
          "min": data.lon,
          "max": data.lon + .2
        })
        console.log(this);
        this.schoolsService.retrieve({page: 1}, {queries: schoolQ}).subscribe(response => {
          this.nearby.schools = response.schools.results;
          console.log(this.nearby.schools);
        })
    });
  }

}
