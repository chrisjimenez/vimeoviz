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
var VideoBlock = React.createClass({
    getEmbeddedVideo : function(videoId){
        var src = "http://player.vimeo.com/video/"+videoId;
        console
        return (
            <iframe src={src} width="100px" height="100px" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
        );
    },


    render : function() {
        return (
            <div className ='video-block'> 
                <div className ="video">
                    {this.getEmbeddedVideo(this.props.videoData.id)}
                </div>
                <div className ="description">
                    {this.props.videoData.description}
                </div>
                <div className ="stats"></div> 
            </div>
        );
    }
});


/**
* video list
*/
var VideoList = React.createClass({
    render : function() {
        var videoBlockNodes = this.props.data.map(function(videoData){
            return (
                <VideoBlock videoData={videoData}/>
            );
        });

        return (
            <div className ='video-list'>
                {videoBlockNodes}
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
    loadSelections : function(){
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    },

    getInitialState : function() {
        return {data : []};
    },
    componentDidMount : function(){
        this.loadSelections();
        setInterval(this.loadSelections(), this.props.pollInterval)
    },

    render : function() {
        return (
            <div className ='main'>
                <SearchField />
                <VideoList data={this.state.data} />
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
                <Main url ="http://vimeo.com/api/v2/channel/staffpicks/videos.json" pollInterval = {2000} />
                <Footer />
            </div>
        );
    }
});

React.render(
    <Container />,
    document.getElementById('container')
);