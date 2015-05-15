/***************************************************************************
By Chris Jimenez

main.js

* functions that begin with an underscore "_" are custom functions.

Component Hierarchy
-------------------
0 Container
    0.0 Header
        0.0.0 SearchField
    0.1 Main
        0.1.0 BubbleChart
        0.1.1 Video
    0.2 Footer
-------------------
***************************************************************************/

/**
* Container
* contains all the elements of the document
**/
var Container = React.createClass({

  _handleSearch : function(searchQuery){
      this._getInfo(searchQuery);
      this._getVideos(searchQuery);
  },

  // AJAX call to get channel info 
  _getInfo : function(searchQuery){
      var infoUrl = "http://vimeo.com/api/v2/channel/"+searchQuery+"/info.json";

      $.ajax({
          url: infoUrl,
          dataType: 'json',
          cache: false,
          success: function(data) {
              //if successful, set info to new data
              this.setState({info: data});
              $('.search-field').val("").css({'color':'black'});
          }.bind(this),
          error: function(xhr, status, err) {
              $('.search-field').val("INVALID SEARCH!").css({'color':'red'});
              console.error(infoUrl, status, err.toString());
          }.bind(this)
      });
  },

  // AJAX call to get video list
  // each call to the Vimeo Simple APi results in 20 items per page
  // response limit is 60 videos using &page param
  _getVideos : function(searchQuery){
      var videoUrl = "http://vimeo.com/api/v2/channel/"+searchQuery+"/videos.json&?page=";

      $.ajax({
          url: videoUrl+"1",
          dataType: 'json',
          cache: false,
          success: function(data1) {
            this.setState({videos: data1});
             $.ajax({
                url: videoUrl+"2",
                dataType: 'json',
                cache: false,
                success: function(data2) {
                      this.setState({videos: data1.concat(data2)});
                     $.ajax({
                        url: videoUrl+"3",
                        dataType: 'json',
                        cache: false,
                        success: function(data3) {
                            this.setState({videos: data1.concat(data2).concat(data3)});
                        }.bind(this),
                        error: function(xhr, status, err) {
                            console.error(videoUrl+"3", status, err.toString());
                        }.bind(this)
                    });  
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(videoUrl+"2", status, err.toString());
                }.bind(this)
              });  
          }.bind(this),
          error: function(xhr, status, err) {
              console.error(videoUrl+"1", status, err.toString());
          }.bind(this)
      });

  },

  componentWillMount : function(){
      this._handleSearch("cats")
  },

  getInitialState: function() {
      return {
          info: [],
          videos: []
      };
  },

  render : function(){
      return (
          <div className = "container">
              <Header onSearchSubmission = {this._handleSearch}/>
              <Main info = {this.state.info} videos = {this.state.videos} />
              <div className ='footer'>
                <a href = "http://www.github.com/chrisjimenez/vimeoviz"> 
                  <img src ="github-icon.png" />
                </a>
              </div>
          </div>
      );
  }
});

/**
* Header
* contains the application title and search form
*/
var Header = React.createClass({
  // Handles the search query submission and passes it to the parent component
  _handleSubmit : function() {
    var searchQuery = React.findDOMNode(this.refs.searchQuery).value.trim();

    if (!searchQuery) {
        return;
    }

    this.props.onSearchSubmission(searchQuery);
  },

  render : function() {
    return (
      <div className ='header'>
        <h3>Vimeo Channel Statistics</h3>
        <div className ="search-form">
          <input className ="search-field" type="text" placeholder="Search for channels" ref = "searchQuery" />
          <input className ="search-button"type="button" value="Search" onClick={this._handleSubmit}/>
        </div>
      </div>
    );
  }
});

/**
* Main
* contains the logo-header, channel information and bubble chart
*/
var Main = React.createClass({

  // Called when a video node is clicked
  _handleVideoClick : function(selectedVideo){
    this.setState({video: selectedVideo});
  },

  // Formats the date string 
  _formatDate : function(date){
    var d = date.split(" ")[0].split("-");

    return d[1]+"/"+d[2]+"/"+d[0]
  },

  getInitialState : function(){
    return {
      video : this.props.videos[0]
    };
  },


  render : function() {
    var title = this.props.info.name,
        dateCreated = this.props.info.created_on ? this._formatDate(this.props.info.created_on) : "?",
        description = this.props.info.description,
        creator = this.props.info.creator_display_name,
        totalVids = this.props.info.total_videos,
        totalSubs = this.props.info.total_subscribers;

    return (
      <div className = "main">
        <img className="logo-header" src = {this.props.info.logo || "https://i.vimeocdn.com/video/default_980x250"} />
        <h1 style ={{'fontWeight':'300'}}>{title} </h1><br />
        Created By <b>{creator}</b> on {dateCreated}
        
        <p>{description}</p>

        <p>
        Videos : <b>{totalVids}</b> <br /> 
        Subscribers : <b>{totalSubs}</b>
        </p>

        <BubbleChart videos = {this.props.videos} onVideoClick = {this._handleVideoClick}/>
        <VideoPlayer video = {this.state.video || this.props.videos[0]} />
      </div>
    );
  }
});

/**
* BubbleChart
* contains the bubble chart and stats of the channel
*/
var BubbleChart = React.createClass({

  // Displays the bubble chart
  _runD3Visualization : function(videos){

    // remove the old svg element from the page 
    d3.select("svg").remove();

    var width = 760,
        height = 600;

    // set up the new svg element
    var svg = d3.select('.bubble-diagram').append('svg')
              .attr('width', width)
              .attr('height', height);

    // video node specs based on statype
    var videoNodeSpecs = {
        'stats_number_of_plays' : {
            'style' : {
                  'stroke': 'green',
                  'fill':'#66CC99',                
                  },
            'max' : 0
        },
        'stats_number_of_likes' : {
            'style' : {
                  'stroke': 'red',
                  'fill':'#DF4949'              
                  },
            'max' : 0
        },
        'stats_number_of_comments' : {
            'style' : {
                  'stroke':'blue',
                  'fill':'#44BBFF'               
                  },

            'max' : 0
        },
        'duration' : {
            'style' : {
                  'stroke':'purple',
                  'fill':'yellow',               
                  },

            'max' : 0       
        }
    }

    //get stat range for each video
    for(var i = 0; i < videos.length; i++){
      if(videoNodeSpecs.stats_number_of_plays.max < videos[i].stats_number_of_plays) 
        videoNodeSpecs.stats_number_of_plays.max = videos[i].stats_number_of_plays;

      if(videoNodeSpecs.stats_number_of_likes.max < videos[i].stats_number_of_likes) 
        videoNodeSpecs.stats_number_of_likes.max = videos[i].stats_number_of_likes;
      
      if(videoNodeSpecs.stats_number_of_comments.max < videos[i].stats_number_of_comments) 
        videoNodeSpecs.stats_number_of_comments.max = videos[i].stats_number_of_comments;
      
      if(videoNodeSpecs.duration.max < videos[i].duration) 
        videoNodeSpecs.duration.max = videos[i].duration;
    }

    // determine stattype 
    var statPicker = document.getElementById('stat-picker'),
      statType = statPicker.options[statPicker.selectedIndex].value;

    // render chart for the first time, 
    // local variable created for  video click handler
    // for reference
    var onVideoClick = this.props.onVideoClick

    renderChart(onVideoClick);

    //update stattype on selection and re-render chart
    statPicker.addEventListener('change', function(e){
        statType = statPicker.options[statPicker.selectedIndex].value;
        renderChart(onVideoClick);
    }, false);


    // small window that disaplys when mouse hovers over a video node
    var tooltip = d3.selectAll(".bubble-diagram").append("div")
                    .attr("class", "tooltip")

    
    // renders the bubble chart
    // uodateCurrentVideo is the passed function
    // that handles when a video node is clicked
    function renderChart(updateCurrentVideo){

      // clear the bar chart
      d3.selectAll("circle").remove();

      //range used based on max value of each node
      var linearScale = d3.scale.linear()
            .domain([0,videoNodeSpecs[statType].max])
            .range([0,100]);

      // set up the force layout for the diagram
      var force = d3.layout.force()
          .nodes(videos)
          .size([width, height])
          .gravity(.05)
          .distance(10)
          .charge(-50)
          .on("tick", function(e){
            var k = 6 * e.alpha;

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
          })
          .start();

      //video nodes
      var node = svg.selectAll(".video-node")
          .data(videos)
        .enter().append("circle")
          .attr("class", "node")
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr("r", function(d){
            return d[statType] ? linearScale(d[statType]) : 0
          })
          .on("mouseover", function(){return tooltip.style("visibility", "visible");})
          .on("mousemove", mousemove)
          .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
          .on('click', updateCurrentVideo)
          .style(videoNodeSpecs[statType].style)
          .call(force.drag);


      // when bubble diagram is clicked, make particles bounce
      d3.select(".bubble-diagram")
          .on("mousedown", function() {
              videos.forEach(function(o, i) {
              o.x += (Math.random() - .5) * 40;
              o.y += (Math.random() - .5) * 40;
            });
            force.resume();
          });
    }

    // Called when mouse hovers over video node
    function mousemove(videoNode) {
      var html = '<h1>'+videoNode.title+'</h1><img src ="'+videoNode.thumbnail_medium+'"></img>' +
                  '<p><span style = "color:green">' +videoNode.stats_number_of_plays+' plays </span> <br />'+
                  '<span style = "color:red">'+videoNode.stats_number_of_likes+' likes</span> <br />' +
                  '<span style = "color:blue">'+videoNode.stats_number_of_comments+' comments</span> </p>';
      tooltip
            .html(html)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
            .style('background-color', 'lightgrey');        
    }   
  },

  componentDidUpdate : function(){
    if(this.props.videos.length > 0){
        this._runD3Visualization(this.props.videos);
    }
  },

  render : function(){
    return (
      <div className ="bubble-chart" >
      <hr />
       <p style = {{'fontSize':'small', 'textAlign':'left'}}>
         <em>Each node represents a video(limit at only 60 videos). The radius of the node depends 
         on what kind of data is being represented, which can be chosen below. 
         If you hover over a node, a small window will show displaying the stats for that video. 
         If you click on it, you can watch it below!</em>
       </p>
        <select id ="stat-picker">
            <option value ='stats_number_of_plays'>Plays</option>
            <option value ='stats_number_of_likes'>Likes</option>
            <option value ='stats_number_of_comments'>Comments</option>
            <option value ='duration'>Duration</option>
        </select>
        <br />
        <div className = "bubble-diagram" />
      </div>
    );
  }
});

/**
* VideoPlayer
* contains the current video chosen
*/
var VideoPlayer = React.createClass({
    render : function(){
      var src = this.props.video ? "http://player.vimeo.com/video/"+this.props.video.id : "",
          height = this.props.video ? this.props.video.height : "450",
          videoDescription = this.props.video ? (this.props.video.description).split("<br />") : ""
      return (
          <div className ="video-player">
              <iframe src={src} width="100%" height ="400px" frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
              <p>
                {videoDescription}
              </p>
          </div>
      );
    }
});

/**
* Renders all the components
*/
React.render(
    <Container />,
    document.body
);