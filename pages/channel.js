import Layout from '../components/Layout'
import ChannelsGrid from '../components/ChannelsGrid'
import PodcastList from '../components/PodcastList'
import Error from './_error'
import PodcastPlayer from '../components/PodcastPlayer'

export default class extends React.Component {

  constructor(props) {
    super(props)
    this.state = { openPodcast: null }
  }

  openPodcast = (event, podcast) => {
    event.preventDefault()
    this.setState({
      openPodcast: podcast
    })
  }

  closePodcast = (event) => {
    event.preventDefault()
    this.setState({
      openPodcast: null
    })
  }

  static async getInitialProps({ query, res }) {
    let idChannel = query.id

    try {
      let [reqChannel, reqSeries, reqAudios] = await Promise.all([
        fetch(`https://api.audioboom.com/channels/${idChannel}`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`)
      ])

      if( reqChannel.status >= 400 ) {
        res.statusCode = reqChannel.status
        return { channel: null, audioClips: null, series: null, statusCode: reqChannel.status }
      }

      let dataChannel = await reqChannel.json()
      let channel = dataChannel.body.channel

      let dataAudios = await reqAudios.json()
      let audioClips = dataAudios.body.audio_clips

      let dataSeries = await reqSeries.json()
      let series = dataSeries.body.channels

      return { channel, audioClips, series, statusCode: 200 }
    } catch (e) {
      return { channel: null, audioClips: null, series: null, statusCode: 503 }
    }
  }

  render () {
    const { channel, audioClips, series, statusCode } = this.props
    const { openPodcast } = this.state

    if( statusCode !== 200) {
      return (
        <Error statusCode={statusCode} />
      )
    }

    return (
      <Layout title={`${channel.title} | Podcasts 🤠`} >
        <div className="banner" style={{ backgroundImage: `url(${channel.urls.banner_image.original})` }} />
          {
            openPodcast && (
              <div className='modal'>
                <PodcastPlayer podcast={openPodcast} onClose={this.closePodcast} />
              </div>
            )
          }
          <h1>{ channel.title }</h1>

          <h2>Series</h2>
          { series.length > 0 &&
            <div>
              <ChannelsGrid channels={series} />
            </div>
          }

          <PodcastList audioClips={audioClips} onClickPodcast={ this.openPodcast }/>


          <style jsx>{`
            .banner {
              width: 100%;
              padding-bottom: 25%;
              background-position: 50% 50%;
              background-size: cover;
              background-color: #aaa;
            }
            h2 {
              padding: 5px;
              font-size: 0.9em;
              font-weight: 600;
              margin: 0;
              text-align: center;
            }
            .modal {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 99999;
              background: black;
            }
          `}</style>

      </Layout>
    )
  }
}
