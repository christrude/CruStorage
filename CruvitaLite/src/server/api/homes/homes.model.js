'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

		var HomeSchema = new Schema({
		    slug: { type: String, lowercase: true, unique: true },
				cruvitaDate: Date,
		    schools: {
		        elementary: { type: String, lowercase: true },
		        middle: { type: String, lowercase: true },
		        high: { type: String, lowercase: true },
		        elementaryScore: Number,
		        middleScore: Number,
		        highScore: Number
		    },
		    multiple: {
		        isChild: Boolean,
		        children: [{ type: Schema.Types.ObjectId, ref: 'Home' }],
		        parent: { type: Schema.Types.ObjectId, ref: 'Home' }
		    },
		    locations: {
		        city: { type : String, lowercase: true },
		        state: { type : String, lowercase: true },
		        county: { type : String, lowercase: true },
		        zip: { type : String, lowercase: true }
		    },
		    listing: {
		        address: {
		            preferenceorder: [ Number ],
		            addresspreferenceorder: [ Number ],
		            fullstreetaddress: { type: String, uppercase: true },
		            unitnumber: [ String ],
		            city: { type: String, uppercase: true },
		            stateorprovince: { type: String, uppercase: true },
		            postalcode: String,
		            country: [ { type: String, uppercase: true } ]
		        },
		        listprice: [ Number ],
		        listpricelow: [ Number ],
		        alternateprices: [{
		            alternateprice: [{
		                alternatelistprice: [ Number ],
		                alternatelistpricelow: [ Number ]
		            }]
		        }],
		        listingurl: [ String ],
		        providername: [ String ],
		        providerurl: [ String ],
		        providercategory: [ String ],
		        leadroutingemail: [ String ],
		        bedrooms: [ Number ],
		        bathrooms: [ Number ],
		        propertytype: [ String ],
		        propertysubtype: [ String ],
		        listingkey: { type: String },
		        listingcategory: { type : String, uppercase: true },
		        listingstatus: [ String ],
		        marketinginformation: [{
		            permitaddressoninternet: [ Boolean ],
		            vowaddressdisplay: [ Boolean ],
		            vowautomatedvaluationdisplay: [ Boolean ],
		            vowconsumercomment: [ Boolean ]
		        }],
		        photos: [{
		            photo: [
		                {
		                    mediamodificationtimestamp: [ Date ],
		                    mediaurl: [ String ],
		                    mediacaption: [ String ],
		                    mediadescription: [ String ]
		                }
		            ]
		        }],
		        discloseaddress: [ Boolean ],
		        listingdescription: [ String ],
		        mlsid: [ String ],
		        mlsname: [ String ],
		        mlsnumber: [ String ],
		        livingarea: [ Number ],
		        lotsize: [ Number ],
		        yearbuilt: [ Number ],
		        listingdate: [ Date ],
		        listingtitle: [ String ],
		        fullbathrooms: [ Number ],
		        threequarterbathrooms: [ Number ],
		        halfbathrooms: [ Number ],
		        onequarterbathrooms: [ Number ],
		        foreclosurestatus: [ String ],
		        listingparticipants: [{
		            participant: [{
		                participantkey: [ String ],
		                participantid: [ String ],
		                firstname: [ String ],
		                lastname: [ String ],
		                role: [ String ],
		                primarycontactphone: [ String ],
		                officephone: [ String ],
		                email: [ String ],
		                fax: [ String ],
		                websiteurl: [ String ]
		            }]
		        }],
		        virtualtours: [{
		            virtualtour: [{
		                mediamodificationtimestamp: [ Date ],
		                mediaurl: [ String ],
		                mediacaption: [ String ],
		                mediadescription: [ String ]
		            }]
		        }],
		        videos: [{
		            video: [{
		                mediamodificationtimestamp: [ Date ],
		                mediaurl: [ String ],
		                mediacaption: [ String ],
		                mediadescription: [ String ]
		            }]
		        }],
		        offices: [{
		            office: [{
		                officekey: [ String ],
		                officeid: [ String ],
		                level: [ String ],
		                officecode: [{
		                    officecodeid: [ String ]
		                }],
		                name: [ String ],
		                corporatename: [ String ],
		                brokerid: [ String ],
		                phoneNumber: [ String ],
		                address: [{
		                    preferenceorder: [ Number ],
		                    addresspreferenceorder: [ Number ],
		                    fullstreetaddress: [ String ],
		                    unitNumber: [ String ],
		                    city: [ String ],
		                    stateorprovince: [ String ],
		                    postalcode: [String],
		                    country: [ String ]
		                }],
		                website: [ String ]
		            }]
		        }],
		        brokerage: [{
		            name: [ String ],
		            phone: [ String ],
		            email: [ String ],
		            websiteurl: [ String ],
		            logourl: [ String ],
		            address: [{
		                preferenceorder: [ Number ],
		                addresspreferenceorder: [ Number ],
		                fullstreetaddress: [ String ],
		                unitNumber: [ String ],
		                city: [ String ],
		                stateorprovince: [ String ],
		                postalcode: [ String ],
		                country: [ String ]
		            }]
		        }],
		        franchise: [{
		            name: [ String ]
		        }],
		        builder: [{
		            name: [ String ],
		            phone: [ String ],
		            fax: [ String ],
		            email: [ String ],
		            websiteurl: [ String ],
		            address: {
		                preferenceorder: [ Number ],
		                addresspreferenceorder: [ Number ],
		                fullstreetaddress: [ String ],
		                city: [ String ],
		                stateorprovince: [ String ],
		                postalcode: [ String ]
		            }
		        }],
		        location: {
								coordinates: {
							    type: [Number],  // [<longitude>, <latitude>]
							    index: '2d'      // create the geospatial index
						    },
		            latitude: Number,
		            longitude: Number,
		            elevation: [ String ],
		            directions: [ String ],
		            geocodeoptions: [ String ],
		            county: { type: String, uppercase: true },
		            parcelid: [ String ],
		            community: [{
		                subdivision: [ String ],
		                schools: [{
		                    school: [
		                        {
		                            name: [ String ],
		                            schoolcategory: [ String ],
		                            district: [ String ],
		                            description: [ Boolean ]
		                        }
		                    ],
		                }]
		            }],
		            neighborhoods: [{
		                neighborhood: [
		                    {
		                        name: [ String ],
		                        description: [ String ]
		                    }
		                ]
		            }]
		        },
		        openhouses: [{
		            openhouse: [{
		                Date: [ Date ],
		                starttime: [ String ],
		                endtime: [ String ],
		                description: [ String ]
		            }]
		        }],
		        taxes: [{
		            tax: [
		                {
		                    year: [ Date ],
		                    amount: [ Number ],
		                    taxdescription: [ String ]
		                },
		                {
		                    year: [ Date ],
		                    amount: [ Number ],
		                    taxdescription: [ String ]
		                }
		            ]
		        }],
		        expenses: [{
		            expense: [
		                {
		                    expensecategory: [ String ],
		                    expensevalue: [ Number ]
		                }
		            ]
		        }],
		        detailedcharacteristics: [{
		            appliances: [{
		                appliance: [
		                     String
		                ]
		            }],
		            architecturestyle: [ String ],
		            hasattic: [ Boolean ],
		            hasbarbecuearea: [ Boolean ],
		            hasbasement: [ Boolean ],
		            buildingunitcount: [ Number ],
		            iscableready: [ Boolean ],
		            hasceilingfan: [ Boolean ],
		            condofloornum: [ Number ],
		            coolingsystems: [{
		                coolingsystem: [ String ]
		            }],
		            hasdeck: [ Boolean ],
		            hasdisabledaccess: [ Boolean ],
		            hasdock: [ Boolean ],
		            hasdoorman: [ Boolean ],
		            hasdoublepanewindows: [ Boolean ],
		            haselevator: [ Boolean ],
		            exteriortypes: [{
		                exteriortype: [
		                     String
		                ]
		            }],
		            hasfireplace: [ Boolean ],
		            floorcoverings: [{
		                floorcovering: [
		                     String
		                ]
		            }],
		            hasgarden: [ Boolean ],
		            hasgatedentry: [ Boolean ],
		            hasgreenhouse: [ Boolean ],
		            heatingfuels: [{
		                heatingfuel: [ String ]
		            }],
		            heatingsystems: [{
		                heatingsystem: [ String ]
		            }],
		            hashottubspa: [ Boolean ],
		            intercom: [ Boolean ],
		            hasjettedbathtub: [ Boolean ],
		            haslawn: [ Boolean ],
		            legaldescription: [ String ],
		            hasmotherinlaw: [ Boolean ],
		            isnewconstruction: [ Boolean ],
		            numfloors: [ Number ],
		            numparkingspaces: [ Number ],
		            haspatio: [ Boolean ],
		            haspond: [ Boolean ],
		            haspool: [ Boolean ],
		            hasporch: [ Boolean ],
		            rooftypes: [{
		                rooftype: [ String ]
		            }],
		            roomcount: [ Number ],
		            rooms: [{
		                room: [
		                      String
		                  ]
		            }],
		            hasrvparking: [ Boolean ],
		            hassauna: [ Boolean ],
		            hassecuritysystem: [ Boolean ],
		            hasskylight: [ Boolean ],
		            hassportscourt: [ Boolean ],
		            hassprinklersystem: [ Boolean ],
		            hasvaultedceiling: [ Boolean ],
		            viewtypes: [{
		                viewtype: [ String ]
		            }],
		            iswaterfront: [ Boolean ],
		            haswetbar: [ Boolean ],
		            iswired: [ Boolean ],
		            yearupDated: [ Date ]
		        }],
		        modificationtimestamp: [ Date ],
		        disclaimer: [ String ]
		    },
		    ingestDate: { type:Number, required:true },
		    status: String
		});

// HomeSchema.index({ 'listing.location.latitude': 1, 'listing.location.longitude': 1 });
// HomeSchema.index({ 'locations.city': 1, 'listing.listingcategory': 1 });
// HomeSchema.index({ 'locations.zip': 1, 'listing.listingcategory': 1  });
// HomeSchema.index({ 'locations.state': 1, 'listing.listingcategory': 1  });
// HomeSchema.index({ 'locations.county': 1, 'listing.listingcategory': 1  });
module.exports = mongoose.model('Home', HomeSchema);