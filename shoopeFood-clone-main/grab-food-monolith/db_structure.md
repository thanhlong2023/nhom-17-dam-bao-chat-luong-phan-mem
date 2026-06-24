- **Bảng:** USERS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh User |
| **FULLNAME** | varchar(100) | None | Thông tin fullName |
| **PHONE** | varchar(15) | Not Null, Unique | Thông tin phone |
| **PASSWORD** | varchar(255) | Not Null | Thông tin password |
| **RATINGAVG** | numeric | None | Thông tin ratingAvg |
| **CREATEDAT** | datetime | None | Thời gian tạo |

- **Bảng:** ROLES

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh Role |
| **NAME** | varchar(50) | Not Null, Unique | Thông tin name |

- **Bảng:** USER_ROLES

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **USERID** | numeric | PK, Not Null, Unique, FK (-> users) | Khóa ngoại tham chiếu user |
| **ROLEID** | numeric | PK, Not Null, Unique, FK (-> roles) | Khóa ngoại tham chiếu role |

- **Bảng:** DRIVER_DETAILS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **USERID** | numeric | PK, Not Null, FK (-> users) | Khóa ngoại tham chiếu user |
| **LICENSEPLATE** | varchar(20) | None | Thông tin licensePlate |
| **IDCARDNUMBER** | varchar(20) | None | Thông tin idCardNumber |
| **VEHICLETYPE** | varchar(50) | None | Thông tin vehicleType |
| **APPROVALSTATUS** | varchar(20) | None | Thông tin approvalStatus |
| **REJECTREASON** | text | None | Thông tin rejectReason |
| **ISONLINE** | boolean | None | Thông tin isOnline |

- **Bảng:** DRIVER_LOCATIONS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh DriverLocation |
| **DRIVERID** | numeric | Not Null, FK (-> users) | Khóa ngoại tham chiếu driver |
| **ORDERID** | bigint | FK (-> orders) | Khóa ngoại tham chiếu order |
| **LATITUDE** | double precision | Not Null | Thông tin latitude |
| **LONGITUDE** | double precision | Not Null | Thông tin longitude |
| **GEOHASH** | varchar(12) | None | Thông tin geohash |
| **HEADING** | double precision | Not Null | Thông tin heading |
| **SPEEDKMH** | double precision | Not Null | Thông tin speedKmh |
| **CREATEDAT** | datetime | None | Thời gian tạo |

- **Bảng:** DRIVER_OFFERS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh DriverOffer |
| **ORDERID** | bigint | Not Null, FK (-> orders) | Khóa ngoại tham chiếu order |
| **DRIVERID** | numeric | Not Null, FK (-> users) | Khóa ngoại tham chiếu driver |
| **STATUS** | varchar(30) | Not Null | Thông tin status |
| **ALGORITHM** | varchar(50) | None | Thông tin algorithm |
| **SEARCHRADIUSKM** | double precision | None | Thông tin searchRadiusKm |
| **DISTANCEKM** | double precision | None | Thông tin distanceKm |
| **PICKUPETAMINUTES** | double precision | None | Thông tin pickupEtaMinutes |
| **DISPATCHSCORE** | double precision | None | Thông tin dispatchScore |
| **OFFEREDAT** | datetime | Not Null | Thông tin offeredAt |
| **RESPONDEDAT** | datetime | None | Thông tin respondedAt |
| **EXPIRESAT** | datetime | None | Thông tin expiresAt |
| **RESPONSEREASON** | text | None | Thông tin responseReason |
| **CANCELLATIONCHARGEABLE** | boolean | Not Null | Thông tin cancellationChargeable |
| **CREATEDAT** | datetime | None | Thời gian tạo |
| **UPDATEDAT** | datetime | None | Thời gian cập nhật |

- **Bảng:** DRIVER_PENALTIES

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh DriverPenalty |
| **DRIVERID** | numeric | Not Null, FK (-> users) | Khóa ngoại tham chiếu driver |
| **TYPE** | varchar(30) | Not Null | Thông tin type |
| **STATUS** | varchar(20) | Not Null | Thông tin status |
| **REASON** | text | None | Thông tin reason |
| **STARTSAT** | datetime | Not Null | Thông tin startsAt |
| **ENDSAT** | datetime | None | Thông tin endsAt |
| **CREATEDAT** | datetime | None | Thời gian tạo |
| **UPDATEDAT** | datetime | None | Thời gian cập nhật |

- **Bảng:** RESTAURANTS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh Restaurant |
| **OWNERID** | numeric | Not Null, FK (-> users) | Khóa ngoại tham chiếu owner |
| **NAME** | varchar(255) | Not Null | Thông tin name |
| **ADDRESS** | text | None | Thông tin address |
| **LATITUDE** | double precision | Not Null | Thông tin latitude |
| **LONGITUDE** | double precision | Not Null | Thông tin longitude |
| **OPENINGTIME** | time | None | Thông tin openingTime |
| **CLOSINGTIME** | time | None | Thông tin closingTime |
| **ISOPEN** | boolean | None | Thông tin isOpen |
| **ISOPENTODAY** | boolean | None | Thông tin isOpenToday |
| **TEMPORARYCLOSEDREASON** | text | None | Thông tin temporaryClosedReason |
| **TEMPORARYCLOSEDUNTIL** | datetime | None | Thông tin temporaryClosedUntil |
| **IMAGEURL** | varchar(255) | None | Thông tin imageUrl |
| **RATINGAVG** | numeric | None | Thông tin ratingAvg |
| **APPROVALSTATUS** | varchar(20) | None | Thông tin approvalStatus |
| **APPROVEDBY** | numeric | None | Thông tin approvedBy |
| **APPROVEDAT** | datetime | None | Thông tin approvedAt |
| **REJECTREASON** | text | None | Thông tin rejectReason |
| **DELETEDAT** | datetime | None | Thông tin deletedAt |

- **Bảng:** RESTAURANT_CHANGE_REQUESTS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh RestaurantChangeRequest |
| **RESTAURANTID** | numeric | Not Null, FK (-> restaurants) | Khóa ngoại tham chiếu restaurant |
| **REQUESTEDBY** | numeric | Not Null | Thông tin requestedBy |
| **PAYLOAD** | json | Not Null | Thông tin payload |
| **STATUS** | varchar(20) | Not Null | Thông tin status |
| **REVIEWEDBY** | numeric | FK (-> users) | Thông tin reviewedBy |
| **REVIEWEDAT** | datetime | None | Thông tin reviewedAt |
| **REJECTREASON** | text | None | Thông tin rejectReason |
| **CREATED_AT** | datetime | Not Null | Thông tin created_at |

- **Bảng:** ORDERS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh Order |
| **ORDERCODE** | varchar(50) | Not Null | Thông tin orderCode |
| **IDEMPOTENCYKEY** | varchar(100) | Not Null, Unique | Thông tin idempotencyKey |
| **CUSTOMERID** | numeric | Not Null, FK (-> users) | Khóa ngoại tham chiếu customer |
| **RESTAURANTID** | numeric | Not Null, FK (-> restaurants) | Khóa ngoại tham chiếu restaurant |
| **DRIVERID** | numeric | FK (-> users) | Khóa ngoại tham chiếu driver |
| **VOUCHERID** | numeric | None | Khóa ngoại tham chiếu voucher |
| **RECEIVERADDRESS** | text | None | Thông tin receiverAddress |
| **RECEIVERLAT** | double precision | None | Thông tin receiverLat |
| **RECEIVERLNG** | double precision | None | Thông tin receiverLng |
| **DISTANCEKM** | double precision | None | Thông tin distanceKm |
| **SUBTOTALAMOUNT** | numeric | None | Thông tin subtotalAmount |
| **TAXAMOUNT** | numeric | None | Thông tin taxAmount |
| **DISCOUNTAMOUNT** | numeric | None | Thông tin discountAmount |
| **TOTALAMOUNT** | numeric | None | Thông tin totalAmount |
| **SHIPPINGFEE** | numeric | None | Thông tin shippingFee |
| **STATUSID** | numeric | Not Null, FK (-> order_statuses) | Khóa ngoại tham chiếu status |
| **STATUSCHANGEDAT** | datetime | None | Thông tin statusChangedAt |
| **NOTE** | text | None | Thông tin note |
| **VERSION** | numeric | Not Null | Thông tin version |
| **CANCELREASON** | text | None | Thông tin cancelReason |
| **CANCELLEDBYROLE** | varchar(20) | None | Thông tin cancelledByRole |
| **CANCELLEDBYUSERID** | numeric | None | Khóa ngoại tham chiếu cancelledByUser |
| **CANCELLEDAT** | datetime | None | Thông tin cancelledAt |
| **DELETEDAT** | datetime | None | Thông tin deletedAt |
| **CREATEDAT** | datetime | None | Thời gian tạo |

- **Bảng:** ORDER_ITEMS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh OrderItem |
| **ORDERID** | bigint | Not Null, FK (-> orders) | Khóa ngoại tham chiếu order |
| **FOODID** | numeric | Not Null, FK (-> food_items) | Khóa ngoại tham chiếu food |
| **FOODNAME** | varchar(255) | Not Null | Thông tin foodName |
| **QUANTITY** | numeric | Not Null | Thông tin quantity |
| **PRICEATORDER** | numeric | Not Null | Thông tin priceAtOrder |

- **Bảng:** ORDER_STATUSES

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh OrderStatus |
| **CODE** | varchar(50) | Not Null, Unique | Thông tin code |
| **LABEL** | varchar(100) | None | Thông tin label |
| **DESCRIPTION** | text | None | Thông tin description |
| **SORTORDER** | numeric | None | Thông tin sortOrder |

- **Bảng:** CATEGORIES

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh Category |
| **RESTAURANTID** | numeric | Not Null, FK (-> restaurants) | Khóa ngoại tham chiếu restaurant |
| **NAME** | varchar(100) | Not Null | Thông tin name |

- **Bảng:** FOOD_ITEMS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh Food |
| **CATEGORYID** | numeric | FK (-> categories) | Khóa ngoại tham chiếu category |
| **NAME** | varchar(255) | Not Null | Thông tin name |
| **IMAGEURL** | varchar(255) | None | Thông tin imageUrl |
| **PRICE** | numeric | Not Null | Thông tin price |
| **ISAVAILABLE** | boolean | None | Thông tin isAvailable |
| **DEFAULTQUANTITY** | numeric | Not Null | Thông tin defaultQuantity |
| **CURRENTQUANTITY** | numeric | Not Null | Thông tin currentQuantity |
| **QUANTITYRESETDATE** | dateonly | None | Thông tin quantityResetDate |
| **DELETEDAT** | datetime | None | Thông tin deletedAt |

- **Bảng:** PAYMENTS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh Payment |
| **ORDERID** | bigint | Not Null, Unique, FK (-> orders) | Khóa ngoại tham chiếu order |
| **IDEMPOTENCYKEY** | varchar(100) | Not Null, Unique | Thông tin idempotencyKey |
| **PAYMENTMETHOD** | enum | Not Null | Thông tin paymentMethod |
| **STATUS** | enum | None | Thông tin status |
| **AMOUNT** | numeric | Not Null | Thông tin amount |
| **CREATEDAT** | datetime | None | Thời gian tạo |
| **UPDATEDAT** | datetime | None | Thời gian cập nhật |

- **Bảng:** PAYMENT_TRANSACTIONS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh PaymentTransaction |
| **PAYMENTID** | bigint | Not Null, FK (-> payments) | Khóa ngoại tham chiếu payment |
| **ATTEMPTNUMBER** | numeric | Not Null | Thông tin attemptNumber |
| **STATUS** | enum | None | Thông tin status |
| **TRANSACTIONREF** | varchar(100) | None | Thông tin transactionRef |
| **GATEWAYRESPONSE** | json | None | Thông tin gatewayResponse |
| **CREATEDAT** | datetime | None | Thời gian tạo |
| **UPDATEDAT** | datetime | None | Thời gian cập nhật |

- **Bảng:** REVIEWS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh Review |
| **ORDERID** | bigint | Not Null, FK (-> orders) | Khóa ngoại tham chiếu order |
| **CUSTOMERID** | numeric | Not Null | Khóa ngoại tham chiếu customer |
| **TARGETTYPE** | enum | Not Null | Thông tin targetType |
| **TARGETID** | numeric | Not Null | Khóa ngoại tham chiếu target |
| **RATING** | tinyint | Not Null | Thông tin rating |
| **COMMENT** | text | None | Thông tin comment |
| **CREATEDAT** | datetime | None | Thời gian tạo |

- **Bảng:** USER_ADDRESSES

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh UserAddress |
| **USERID** | numeric | Not Null, FK (-> users) | Khóa ngoại tham chiếu user |
| **LABEL** | varchar(50) | None | Thông tin label |
| **PLACEID** | varchar(255) | None | Khóa ngoại tham chiếu place |
| **FORMATTEDADDRESS** | text | Not Null | Thông tin formattedAddress |
| **LATITUDE** | double precision | Not Null | Thông tin latitude |
| **LONGITUDE** | double precision | Not Null | Thông tin longitude |
| **PROVINCE** | varchar(100) | None | Thông tin province |
| **DISTRICT** | varchar(100) | None | Thông tin district |
| **WARD** | varchar(100) | None | Thông tin ward |
| **STREET** | varchar(255) | None | Thông tin street |
| **HOUSENUMBER** | varchar(50) | None | Thông tin houseNumber |
| **NOTE** | text | None | Thông tin note |
| **PROVIDER** | varchar(30) | Not Null | Thông tin provider |
| **CREATEDAT** | datetime | None | Thời gian tạo |

- **Bảng:** TOPPINGS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh Topping |
| **RESTAURANTID** | numeric | Not Null, FK (-> restaurants) | Khóa ngoại tham chiếu restaurant |
| **NAME** | varchar(255) | Not Null | Thông tin name |
| **PRICE** | numeric | Not Null | Thông tin price |
| **ISAVAILABLE** | boolean | None | Thông tin isAvailable |
| **DEFAULTQUANTITY** | numeric | Not Null | Thông tin defaultQuantity |
| **CURRENTQUANTITY** | numeric | Not Null | Thông tin currentQuantity |
| **QUANTITYRESETDATE** | dateonly | None | Thông tin quantityResetDate |
| **STARTDATE** | dateonly | None | Thông tin startDate |
| **ENDDATE** | dateonly | None | Thông tin endDate |
| **DELETEDAT** | datetime | None | Thông tin deletedAt |

- **Bảng:** FOOD_TOPPINGS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **FOODID** | numeric | PK, Not Null, Unique, FK (-> food_items) | Khóa ngoại tham chiếu food |
| **TOPPINGID** | numeric | PK, Not Null, Unique, FK (-> toppings) | Khóa ngoại tham chiếu topping |

- **Bảng:** ORDER_ITEM_TOPPINGS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | bigint | PK, Not Null | Mã định danh OrderItemTopping |
| **ORDERITEMID** | bigint | Not Null, FK (-> order_items) | Khóa ngoại tham chiếu orderItem |
| **TOPPINGID** | numeric | Not Null, FK (-> toppings) | Khóa ngoại tham chiếu topping |
| **TOPPINGNAME** | varchar(255) | Not Null | Thông tin toppingName |
| **PRICEATORDER** | numeric | Not Null | Thông tin priceAtOrder |
| **QUANTITY** | numeric | Not Null | Thông tin quantity |

- **Bảng:** VOUCHERS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh Voucher |
| **CODE** | varchar(255) | Not Null, Unique | Thông tin code |
| **DISCOUNTTYPE** | varchar(255) | Not Null | Thông tin discountType |
| **DISCOUNTVALUE** | numeric | Not Null | Thông tin discountValue |
| **MINORDERVALUE** | numeric | None | Thông tin minOrderValue |
| **MAXDISCOUNTAMOUNT** | numeric | None | Thông tin maxDiscountAmount |
| **VALIDFROM** | datetime | Not Null | Thông tin validFrom |
| **VALIDUNTIL** | datetime | Not Null | Thông tin validUntil |
| **USAGELIMIT** | numeric | None | Thông tin usageLimit |
| **USEDCOUNT** | numeric | None | Thông tin usedCount |
| **ISACTIVE** | boolean | None | Thông tin isActive |
| **CREATEDAT** | datetime | Not Null | Thời gian tạo |
| **UPDATEDAT** | datetime | Not Null | Thời gian cập nhật |

- **Bảng:** SYSTEM_SETTINGS

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |
| :--- | :--- | :--- | :--- |
| **ID** | numeric | PK, Not Null | Mã định danh SystemSetting |
| **KEY** | varchar(255) | Not Null, Unique | Thông tin key |
| **VALUE** | text | Not Null | Thông tin value |
| **DESCRIPTION** | varchar(255) | None | Thông tin description |
| **CREATEDAT** | datetime | Not Null | Thời gian tạo |
| **UPDATEDAT** | datetime | Not Null | Thời gian cập nhật |

