import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd, RoutesRecognized, NavigationError } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'jhi-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();

  constructor(private titleService: Title, private router: Router, private $storageService: StateStorageService) {}

  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
      }
      if (event instanceof RoutesRecognized) {
        const destinationEvent = event.state.root.firstChild!.children[0];
        const params = destinationEvent.params;
        const destinationData = destinationEvent.data;
        const destinationName = destinationEvent.url[0].path;
        const from = { name: this.router.url.slice(1) };
        const destination = { name: destinationName, data: destinationData };
        this.$storageService.storeDestinationState(destination, params, from);
      }
      if (event instanceof NavigationError && event.error.status === 404) {
        this.router.navigate(['/404']);
      }
    });
  }

  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getPageTitle(routeSnapshot: ActivatedRouteSnapshot): string {
    let title: string = routeSnapshot.data['pageTitle'] ? routeSnapshot.data['pageTitle'] : 'jHipsterRegistryApp';
    if (routeSnapshot.firstChild) {
      title = this.getPageTitle(routeSnapshot.firstChild) || title;
    }
    return title;
  }
}
