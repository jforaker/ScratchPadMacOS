#import <Cocoa/Cocoa.h>
#import <React/RCTComponent.h>

@interface NativeScratchEditorView : NSView

@property (nonatomic, copy) NSString *text;
@property (nonatomic, copy) NSString *placeholder;
@property (nonatomic, assign) CGFloat fontSize;
@property (nonatomic, copy) NSString *fontFamily;
@property (nonatomic, assign) BOOL darkMode;
@property (nonatomic, copy) RCTBubblingEventBlock onChange;

@end
