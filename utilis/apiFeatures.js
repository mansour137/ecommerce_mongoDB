class ApiFeatures{
    constructor(query , queryString) {
        this.query = query;
        this.queryString = queryString
    }
    filter(){
        let queryObj = {...this.queryString};
        let excludedQuery = ['search' , 'sort' , 'page' , 'limit' , 'skip'];
        excludedQuery.forEach(el=>delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}`);
        this.queryString = JSON.parse(queryStr);

        this.query.find(this.queryString);
        return this;
    }
    sort(){
         this.query = (this.queryString.sort? this.query.sort(this.queryString.sort.split(',').join(' ')) : this.query.sort('createdAt'));
        return this;
    }
    paginate(){
        let limit = +this.queryString.limit || 10;
        let page = +this.queryString.page || 1;
        let skip = (page -1 ) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = ApiFeatures;