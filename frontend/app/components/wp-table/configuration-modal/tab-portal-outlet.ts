/**
 * A PortalOutlet that lets multiple components live for the lifetime of the outlet,
 * allowing faster switching and persistent data.
 */
import {BasePortalOutlet, ComponentPortal, PortalOutlet} from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injector
} from '@angular/core';

export interface TabInterface {
  name:string;
  componentClass:{ new(injector:Injector):any };
}

export interface ActiveTabInterface {
  portal:ComponentPortal<any>;
  componentRef:ComponentRef<any>;
  dispose:() => void;
}

export class TabPortalOutlet {

  // Active tabs that have been instantiated
  public activeTabs:{ [name:string]:ActiveTabInterface } = {};

  // The current tab
  public currentTab:ActiveTabInterface|null = null;

  constructor(
    public availableTabs:TabInterface[],
    public outletElement:Element,
    private componentFactoryResolver:ComponentFactoryResolver,
    private appRef:ApplicationRef,
    private injector:Injector) {
  }

  public switchTo(tab:TabInterface) {
    // Detach any current instance
    this.detach();

    // Get existing or new component instance
    const instance = this.activateInstance(tab);

    // At this point the component has been instantiated, so we move it to the location in the DOM
    // where we want it to be rendered.
    this.outletElement.innerHTML = '';
    this.outletElement.appendChild(this._getComponentRootNode(instance.componentRef));
  }

  public detach():void {
    const current = this.currentTab;
    if (current !== null) {
      current.portal.setAttachedHost(null);
      this.appRef.detachView(current.componentRef.hostView);
      this.currentTab = null;
    }
  }

  /**
   * Clears out a portal from the DOM.
   */
  dispose():void {
    // Dispose all active tabs
    _.each(this.activeTabs, active => active.dispose());

    // Remove outlet element
    if (this.outletElement.parentNode != null) {
      this.outletElement.parentNode.removeChild(this.outletElement);
    }
  }

  private activateInstance(tab:TabInterface):ActiveTabInterface {
    if (!this.activeTabs[tab.name]) {
      this.activeTabs[tab.name] = this.createComponent(tab);
    }

    return this.activeTabs[tab.name] || null;
  }

  private createComponent(tab:TabInterface):ActiveTabInterface {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(tab.componentClass);
    const componentRef = componentFactory.create(this.injector);
    const portal = new ComponentPortal(tab.componentClass, null, this.injector);

    // Attach component view
    this.appRef.attachView(componentRef.hostView);

    return {
      portal: portal,
      componentRef: componentRef,
      dispose: () => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      }
    };
  }

  /** Gets the root HTMLElement for an instantiated component. */
  private _getComponentRootNode(componentRef:ComponentRef<any>):HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }
}
