let baseURL = 'https://content.guardianapis.com';
let apiKey = 'api-key=0cc1c5bc-7fe4-47bc-80cc-f17c13be193c';
let category = 'trending';
let pageSize = 20;

let selectedArticle = null

                                            /*getting data*/
let fetchedData = {
    news: [],
    error: null
}

const fetchData = async function fetchNews (query) {
    try {
        document.body.classList.remove('loaded');
        let response = await fetch( `${baseURL}/search?q=${query}&show-tags=all&page-size=${pageSize}&show-fields=all&order-by=relevance&${apiKey}`)
            .then(response => response.json())
        fetchedData.news = response.response.results
        document.body.classList.add('loaded');
        document.body.classList.remove('loaded_hiding');
    }
    catch (e){
        fetchedData.error = e.message
    }
}
                        /*Burger menu and depends elem*/
const categoriesElem = document.querySelector(".categories");
const trendingNewsElem = document.querySelector(".trend");
const menuButton = document.querySelector(".nav-toggle");
menuButton.addEventListener('click', () => {
   if(menuButton.classList.contains('active')) {
       menuButton.classList.remove('active')
       categoriesElem.classList.remove('activeItem')
       trendingNewsElem.classList.remove('activeItem')
   } else {
       menuButton.classList.add('active')
       categoriesElem.classList.add('activeItem')
       trendingNewsElem.classList.add('activeItem')

   }
})
                               /*getting content elem*/
const listBlock = document.querySelector(".newsListBlock");
const headBlock = document.querySelector(".topNewsBlock");
const categories = document.querySelectorAll(".subMenu > div > a ")
Array.from(categories).forEach((item) => item.addEventListener('click', () => {
    fillUpListBlock(item.firstChild.data)
}))
                                          /*Work with Text*/

const cutText = (text, n) => {
    return text.slice(0, n)
}
                                        /*Work with Date*/
let daysInMonth = [0,31,28,31,30,31,30,31,31,30,31,30,31]
function today () {
    let date = new Date()
    const year = date.getFullYear();
    const month = date.getMonth() < 10 ? `0${date.getMonth() }` : date.getMonth();
    const day = date.getDate() < 10 ? `0${date.getDate() }` : date.getDate();
    return  [day, +month+1, year]
}

function parseComingDate (data) { // []
    if (data){
        return data.split('T')[0].split("-").reverse().map(num => Number.parseInt(num));
    } else return 'no date'
}

const checkFreshDate = (data) => {
    return parseComingDate(data).reduce((sum, item, i) => {
       switch(i) {
            case 0:
                return sum + item
            case 1:
                return sum + item*daysInMonth[item]
            case 2:
                return  sum + item*365
        }
       }, 0);
}

                        /*main page  news */
let pastTimeArr = []                                    // [day, month, year]

                                            /*fixation view*/

function goByLinkAndFixedView(e){
    let parent = e.currentTarget.parentElement
    let memoAndGo = (key) =>{
        selectedArticle = fetchedData.news.filter(elem => elem.fields.headline.slice(0,10) === key)
        localStorage.setItem(key, 'viewed')
        localStorage.setItem("selected news", JSON.stringify(selectedArticle))
        window.location.href = "./details_page/selectedNews.html"
    }
                              /*where was click*/
    if (parent.classList.contains('topNewsBlock')  || (parent.classList.contains('mainNewsCard'))){
    let key = parent.querySelector('h1').innerHTML.slice(0,10)
    memoAndGo(key)
    } else if(parent.parentElement.parentElement.className === 'mainNewsCard'){
    let key = parent.parentElement.parentElement.parentElement.querySelector('h1').innerHTML.slice(0,10)
    memoAndGo(key)
                 /*for list news cards*/
    } else if(e.currentTarget.nodeName === "H4"){
        let key = parent.parentElement.parentElement.querySelector('h3').innerHTML.slice(0,10)
    memoAndGo(key)
    }else {
        let key = parent.querySelector('h3').innerHTML.slice(0,10)
    memoAndGo(key)
    }
}
                                           /*list news html*/
const createNewsList = (news) => {
    listBlock.innerHTML = news.map((item, i) =>
         `<div class="newsItemCard"> 
                   <img src = "${item.fields.thumbnail}" alt ="UI/laptop.png">
                   <div>
                       <h3>${cutText(item.fields.headline, 50)}...</h3>
                       ${cutText(item.fields.bodyText, 125)}...
                       <div class="newsItemCard__footer">
                           <div> 
                                <div>
                                    ${pastTimeArr[i][0]+(pastTimeArr[i][1]*daysInMonth[pastTimeArr[i][1]])} days ago
                                </div>
                                <div class="newsItemCard__articleStatus">
                                     ${localStorage.getItem(item.fields.headline.slice(0,10)) ? 'viewed': 'not viewed'} 
                                </div>
                           </div>
                           <div> 
                                <h4>Read more</h4>
                           </div>
                       </div>
                   </div>  
              </div>`).join(' ')
}

async function kindOfComingData (kind, findItem) {
    if (!findItem) {
        return await fetchData(kind).then(()=> fetchedData.news)
         }
    else {
        return findItem
    }
}

const fillUpListBlock = (kind, findItem) => {
    kindOfComingData(kind, findItem)
        .then(
        (data) => {
            pastTimeArr = data.reduce((arr,item) => {
                let articleDate = parseComingDate(item.webPublicationDate);
                let nowadays = today();
                let dateDifference = nowadays.map((item,i) => {
                    return item - articleDate[i]
                })
                return [... arr,dateDifference]
            },[]);
            createNewsList(data)
            return data
        }).then((data) => {if (data.length>1){fillUpHeadBlock()}})
        .then((()=> {
            const articleCardImage = document.querySelectorAll(".newsItemCard  > img ");
            Array.from(articleCardImage).forEach((item) => item.addEventListener('click', (e) => {
                goByLinkAndFixedView(e)
            }))
            const articleCardDescription = document.querySelectorAll(".newsItemCard  h3 ")
            Array.from(articleCardDescription).forEach((item) => item.addEventListener('click', (e) => {
                goByLinkAndFixedView(e)
            }))
            const articleReadMore = document.querySelectorAll(".newsItemCard  h4 ")
            Array.from(articleReadMore).forEach((item) => item.addEventListener('click', (e) => {
                goByLinkAndFixedView(e)
            }))
        }))
}
                       /*main page most recent news html*/
function fillUpHeadBlock () {
    let auxObj = {}
    let dateNumberSumValueArr = fetchedData.news.map(item => {
       return checkFreshDate(item.webPublicationDate)
    })
    fetchedData.news.forEach((item, i) => {auxObj[item.id] = dateNumberSumValueArr[i]} )
    let sortedNewsByDate = Object.keys(auxObj).sort((a,b) => { return auxObj[b] - auxObj[a]})
    let mostFreshNews = fetchedData.news.find(item => item.id === sortedNewsByDate[0])
    let indexOfMostFresh = fetchedData.news.indexOf(mostFreshNews)
    headBlock.innerHTML = `<div class = "mainNewsCard"> 
                                <h1>${mostFreshNews.fields.headline} </h1>
                                ${cutText(mostFreshNews.fields.bodyText, 120)}...
                                <div>
                                    <div>
                                        <div>
                                             ${pastTimeArr[indexOfMostFresh][0]+(pastTimeArr[indexOfMostFresh][1]*daysInMonth[pastTimeArr[indexOfMostFresh][1]])} days ago
                                         </div>
                                         <div class="newsItemCard__articleStatus">
                                              ${localStorage.getItem(mostFreshNews.fields.headline.slice(0,10)) ? 'viewed': 'not viewed'}
                                          </div>
                                    </div>
                                     <div>
                                         <h4>Read more</h4>  
                                     </div>
                                </div>
                           </div>
                           <img src = "${mostFreshNews.fields.thumbnail}" alt ="UI/laptop.png">`

                                         /*addEventListener to go to next page*/

    const mainNewsCardImage = document.querySelectorAll(".topNewsBlock  > img ");
    Array.from(mainNewsCardImage).forEach((item) => item.addEventListener('click', (e) => {
        goByLinkAndFixedView(e)
    }))
    const mainNewsCardDescription = document.querySelectorAll(".mainNewsCard  h1 ")
    Array.from(mainNewsCardDescription).forEach((item) => item.addEventListener('click', (e) => {
        goByLinkAndFixedView(e)
    }))
    const mainNewsCardReadMore = document.querySelectorAll(".mainNewsCard  h4 ")
    Array.from(mainNewsCardReadMore).forEach((item) => item.addEventListener('click', (e) => {
        goByLinkAndFixedView(e)
    }))
}

fillUpListBlock(category)

                        /*section  for ScrollToTop button*/
window.addEventListener('scroll', trackScroll);

const btnScrollToTop = document.querySelector(".btnScrollToTop")
btnScrollToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
    })
})
function trackScroll() {
    let scrolled = window.scrollY;
    let coords =1000;

    if (scrolled > coords) {
        btnScrollToTop.classList.add('show');
    }
    if (scrolled < coords) {
        btnScrollToTop.classList.remove('show');
    }
}
                                        /*submenu*/
const submenuElem = document.querySelector(".subMenu")
categoriesElem.addEventListener('mouseenter', e => submenuElem.classList.add('visible') )
categoriesElem.addEventListener('mouseleave', e => {
    let timeout = setTimeout(() => {
        submenuElem.classList.remove('visible')
    },400)
    submenuElem.addEventListener('mouseenter', e => clearTimeout(timeout) )
    submenuElem.addEventListener('mouseleave', e => submenuElem.classList.remove('visible'))
} )

                                        /*Search*/
let EnRuKey = {
    "q":"й", "w":"ц", "e":"у", "r":"к", "t":"е", "y":"н", "u":"г",
    "i":"ш", "o":"щ", "p":"з", "[":"х", "]":"ъ", "a":"ф", "s":"ы",
    "d":"в", "f":"а", "g":"п", "h":"р", "j":"о", "k":"л", "l":"д",
    ";":"ж", "'":"э", "z":"я", "x":"ч", "c":"с", "v":"м", "b":"и",
    "n":"т", "m":"ь", ",":"б", ".":"ю"
}

let RuEnKey= {
    "а":"f", "б":",", "в": "d", "г": "u", "д": "l", "е": "t", "ж": ";", "з": "p", "и": "b", "й": "q", "к": "r", "л": "k", "м": "v", "н": "y", "о": "j", "п": "g", "р": "h", "с": "c", "т": "n", "у": "e", "ф": "a", "х": "[", "ц": "w", "ч": "x", "ш": "i", "щ": "o", "ъ": "]", "ы": "s", "ь": "m", "э": "'", "ю": ".", "я": "z",
}
let searching = (q) =>  fetchedData.news.filter(elem => elem.fields.headline.toLowerCase().includes(q))

let wrongChainSearching = (wq) => {
let arrFromQuery = wq.split('')
    console.log(arrFromQuery)
    let result = null
    let itemHeaderArr =  fetchedData.news.map(elem => elem.fields.headline.toLowerCase().split(' '))
     itemHeaderArr.forEach((innerArr,i,thisArr1) => {
         innerArr.forEach((str, i,thisArr2) => {
                 let innerRes = arrFromQuery.every((letter) => str.includes(letter))
                  if(innerRes){
                       result = searching(thisArr2.join(' '))
                  }
                  })
     })
    return result
}

function searchNews(query) {
    let preparedQuery = query.toLowerCase().trim()
    let replaceLangQuery = preparedQuery.split('').map(symbol => {
        if (typeof (RuEnKey[symbol])!== "undefined"){
            return RuEnKey[symbol]
        }else return [0,1,2,3,4,5]                  // this array is necessary to create wrong string in next step
       }).join('')
    let searchResult = searching(preparedQuery)
    let searchResultWithTranslate =  searching(replaceLangQuery)
    let searchWithWrongChain = wrongChainSearching(preparedQuery)
       if(searchResult.length !== 0){
           return searchResult
       } else if (searchResultWithTranslate.length !== 0) {
           return searchResultWithTranslate
       } else if (searchWithWrongChain.length !== 0){
           return searchWithWrongChain
       }
       else
           return 'No exact matches found'
}

                             /*hang listeners to search and clear search*/
document.querySelector('input').addEventListener('keydown', e => {
    if(e.key === "Enter") {
        let queryNews = searchNews(e.target.value)
            return handleSearch(queryNews)
        }
})
document.querySelector('.inputWrapper > img').addEventListener('click', e => {
    let text = document.querySelector('input').value
    let queryNews = searchNews(text)
    return handleSearch(queryNews)
})
document.querySelector('.clearSearchBtn').addEventListener('click', e => {
    document.querySelector('input').value ='';
    fillUpListBlock(category, fetchedData.news)
})

function handleSearch(queryNews) {
    if (typeof(queryNews) !== 'string'){
        fillUpListBlock(category, queryNews )
    } else { document.querySelector('.noResultBanner').classList.add('show')
        setTimeout(()=> {
            document.querySelector('.noResultBanner').classList.remove('show')
        },2000)

    }
}




