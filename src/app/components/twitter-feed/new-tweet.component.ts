import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogService, WindowService, TwitterService, TWITTER_ACTIONS, SNAPSHOT_ACTIONS, TweetModel, IAudiographState, IPlaylistTrack, ISnapshotState } from '../../shared/index';


@Component({
  selector: 'new-tweet',
  templateUrl: './app/components/twitter-feed/new-tweet.component.html',
  styleUrls: ['./app/components/twitter-feed/new-tweet.component.css']
})
export class NewTweetComponent {
  public newTweetTxt: string;
  public sending: boolean;
  
  constructor(private logger: LogService, private win: WindowService, public twitterService: TwitterService, private store: Store<any>, @Inject('fullpage') private fullpage) {
    store.select('audiograph').subscribe((state: IAudiographState) => {
      let activeTrack: IPlaylistTrack;
      for (let item of state.playlist) {
        if (item.active) {
          activeTrack = item;
          break;
        }
      }
      this.newTweetTxt = `Listening to '${activeTrack.trackName}' on #ngTunes #ngAttackArt @AngularAttack http://48angles.2016.angularattack.io/`;
    });
    store.select('snapshot').subscribe((state: ISnapshotState) => {
      if (state.image) {
        this.postScreenshot(state.image);
      }
    });
  }

  
  public prepareTweet(value: string) {
    this.sending = true;
    this.logger.debug(this.newTweetTxt);
    this.store.dispatch({ type: SNAPSHOT_ACTIONS.SNAPSHOT_NOW, payload: { element: this.fullpage } });
  }

  private postScreenshot(image: any) {
    this.twitterService.uploadImage(image, this.newTweetTxt).subscribe((response: any) => {
      this.logger.debug(response);
      this.twitterService.postStatus(response.media_id_string).subscribe((response: any) => {
        this.win.alert('Tweet Posted!');
        this.sending = false;
      });
      
    });
  }
}
