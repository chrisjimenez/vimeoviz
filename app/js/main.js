/***************************************************************************
* Vimeo Search
* main.js
*
* Component hierarchy
*
* Content
* --/Header
* --/Main
* ----/SearchField
* ----/VideoList
* -------/Video
* ----/PageNav
* --/Footer
***************************************************************************/
'use strict';

var data = [
  {author: "Pete Hunt", text: "This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];



/**
* Search field 
*/
var SearchField = React.createClass({
    render : function() {
        return (
            <form className ='search-field'></form>
        );
    }
});

/**
* Page navigation 
*/
var PageNav = React.createClass({
    render : function() {
        return (
            <nav className="page-nav">page nav</nav>
        );
    }
});

/**
* video 
*/
var Video = React.createClass({
    render : function() {
        return (
            <div className ='video-block'> 
                <div className ="video"></div>
                <div className ="description"></div>
                <div className ="stats"></div> 
            </div>
        );
    }
});


/**
* video List
*/
var VideoList = React.createClass({
    render : function() {
        var videoNodes = this.props.data.map(function(video){
            return (
                <Video></Video>
            );
        });


        return (
            <div className ='video-list'>
                {videoNodes}
            </div>
        );
    }
});

/**
* Header
*/
var Header = React.createClass({
    render : function() {
        return (
            <div className ='header'>
                <h1> HEADER </h1>
            </div>
        );
    }
});


/**
* main
*/
var Main = React.createClass({
    render : function() {
        return (
            <div className ='main'>
                <SearchField />
                <VideoList data={this.props.data} />
            </div>
        );
    }
});



/**
* Footer
*/
var Footer = React.createClass({
    render : function() {
        return (
            <div className ='footer'>
                <PageNav />
                <h1> FOOTER </h1>
            </div>
        );
    }
});



/**
* Container
*/
var Container = React.createClass({
    render : function() {
        return (
            <div>
                <Header />
                <Main data={data} />
                <Footer />
            </div>
        );
    }
});

React.render(
    <Container />,
    document.getElementById('container')
);