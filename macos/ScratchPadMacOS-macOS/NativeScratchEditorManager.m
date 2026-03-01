#import <React/RCTViewManager.h>
#import "NativeScratchEditorView.h"

@interface NativeScratchEditorManager : RCTViewManager
@end

@implementation NativeScratchEditorManager

RCT_EXPORT_MODULE(NativeScratchEditor)

- (NSView *)view
{
  return [[NativeScratchEditorView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(text, NSString)
RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString)
RCT_EXPORT_VIEW_PROPERTY(fontSize, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(fontFamily, NSString)
RCT_EXPORT_VIEW_PROPERTY(darkMode, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock)

@end
