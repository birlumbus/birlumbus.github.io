export function leavePage(event,renderers,stop){
 if(event.persisted)return;
 stop();for(const renderer of renderers)renderer.dispose();
}
