# 目标 
在房间列表模块的标题中，右侧添加选项框，选择男众房，女众房，并添加一个选项框能够选择起始框，为入住时间，默认选择当天的房间状态。

# 数据
在room组件调用getRoomStatus函数，并且将拿到的数给roomInfo中，展示房间，并且给每个床位绑定上对应的id，getRoomStatus的返回值和下面的结构体是一样的

{
    "code": 0,
    "message": "success",
    "data": {
        "male": {
            "gender": 1,
            "totalRooms": 2,
            "totalFloors": 1,
            "floors": [
                {
                    "floor": 1,
                    "rooms": [
                        {
                            "roomId": 25,
                            "roomNo": "102",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 1,
                            "genderName": "男",
                            "capacity": 8,
                            "occupiedCount": 0,
                            "beds": [
                                {
                                    "bedId": 117,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 118,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 119,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 120,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 121,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 122,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 123,
                                    "bedNo": "4-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 124,
                                    "bedNo": "4-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        },
                        {
                            "roomId": 24,
                            "roomNo": "106",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 1,
                            "genderName": "男",
                            "capacity": 6,
                            "occupiedCount": 3,
                            "beds": [
                                {
                                    "bedId": 103,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": true
                                },
                                {
                                    "bedId": 104,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": true
                                },
                                {
                                    "bedId": 105,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": true
                                },
                                {
                                    "bedId": 106,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 107,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 108,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "female": {
            "gender": 2,
            "totalRooms": 6,
            "totalFloors": 1,
            "floors": [
                {
                    "floor": 4,
                    "rooms": [
                        {
                            "roomId": 18,
                            "roomNo": "406",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 2,
                            "genderName": "女",
                            "capacity": 16,
                            "occupiedCount": 0,
                            "beds": [
                                {
                                    "bedId": 57,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 58,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 59,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 60,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 61,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 62,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 63,
                                    "bedNo": "4-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 64,
                                    "bedNo": "4-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 109,
                                    "bedNo": "5-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 110,
                                    "bedNo": "5-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 111,
                                    "bedNo": "6-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 112,
                                    "bedNo": "6-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 113,
                                    "bedNo": "7-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 114,
                                    "bedNo": "7-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 115,
                                    "bedNo": "8-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 116,
                                    "bedNo": "8-下",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                }
                            ]
                        },
                        {
                            "roomId": 19,
                            "roomNo": "407",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 2,
                            "genderName": "女",
                            "capacity": 8,
                            "occupiedCount": 0,
                            "beds": [
                                {
                                    "bedId": 65,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 66,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 67,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 68,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 69,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 70,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 71,
                                    "bedNo": "4-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 72,
                                    "bedNo": "4-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        },
                        {
                            "roomId": 20,
                            "roomNo": "415",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 2,
                            "genderName": "女",
                            "capacity": 8,
                            "occupiedCount": 0,
                            "beds": [
                                {
                                    "bedId": 73,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 74,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 75,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 76,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 77,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 78,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 79,
                                    "bedNo": "4-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 80,
                                    "bedNo": "4-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        },
                        {
                            "roomId": 21,
                            "roomNo": "416",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 2,
                            "genderName": "女",
                            "capacity": 8,
                            "occupiedCount": 2,
                            "beds": [
                                {
                                    "bedId": 81,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 82,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": true
                                },
                                {
                                    "bedId": 83,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 84,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 85,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 86,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 87,
                                    "bedNo": "4-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": true
                                },
                                {
                                    "bedId": 88,
                                    "bedNo": "4-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        },
                        {
                            "roomId": 22,
                            "roomNo": "421",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 2,
                            "genderName": "女",
                            "capacity": 8,
                            "occupiedCount": 0,
                            "beds": [
                                {
                                    "bedId": 89,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 90,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 91,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 92,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 93,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 94,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 95,
                                    "bedNo": "4-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 96,
                                    "bedNo": "4-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        },
                        {
                            "roomId": 23,
                            "roomNo": "422",
                            "roomType": "1",
                            "roomTypeName": "客房",
                            "gender": 2,
                            "genderName": "女",
                            "capacity": 6,
                            "occupiedCount": 0,
                            "beds": [
                                {
                                    "bedId": 97,
                                    "bedNo": "1-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 98,
                                    "bedNo": "1-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 99,
                                    "bedNo": "2-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 100,
                                    "bedNo": "2-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 101,
                                    "bedNo": "3-上",
                                    "bedType": 1,
                                    "bedTypeName": "上铺",
                                    "occupied": false
                                },
                                {
                                    "bedId": 102,
                                    "bedNo": "3-下",
                                    "bedType": 2,
                                    "bedTypeName": "下铺",
                                    "occupied": false
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    "timestamp": 1765645312823,
    "success": true
}